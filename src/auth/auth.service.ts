import { ConflictException, Injectable, NotFoundException, Res, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

import * as bcrypt from 'bcrypt';
import { userBaseSelect } from 'src/users/users.selects';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { SessionMetaDto } from 'src/common/dto/session-meta.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from 'src/mail/mail.service';
import { verifyEmailTemplate } from 'src/mail/templates/verify-email.template';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { resetPasswordTemplate } from 'src/mail/templates/reset-password.template';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayloadType } from 'src/common/types/jwt-payload.type';

@Injectable()
export class AuthService {
    private SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService
    ) {

    }

    // register
    async register(
        registerDto: RegisterDto,
        sessionMeta: SessionMetaDto): Promise<AuthResponseDto> {
        
        // extract data
        const {email, password, firstName, lastName, phone} = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: {email} 
        });

        if(existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // password hash
        const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
        
        // session data
        const ipAddress = sessionMeta.ipAddress;
        const userAgent = sessionMeta.userAgent;
        const expiresAt = new Date(Date.now() + 7*24*60*60*1000); // 7 days

        // transaction
        const result = await this.prisma.$transaction(
            async(tx) => {
                // create user
                const user = await tx.user.create({
                    data: {
                        email,
                        passwordHash,
                        firstName,
                        lastName,
                        phone,
                    },
                    select: userBaseSelect
                });

                // generate tokens/refreshId
                const { refreshId, accessToken, refreshToken } = 
                        await this.generateTokens(user.id, email);

                // hash refresh token
                const refreshTokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
                
                // create session
                await tx.userSession.create({
                    data: {
                        id: refreshId,
                        userId: user.id,
                        refreshTokenHash,
                        ipAddress,
                        userAgent,
                        expiresAt
                    }
                })
                return {
                    accessToken,
                    refreshToken,
                    user
                }
            }
        )

        // send email verification
        const emailToken = await this.jwtService.signAsync(
            {sub: result.user.id},
            {expiresIn: '1d'}
        );
        await this.mailService.sendMail(
            result.user.email,
            'Verify your email address',
            verifyEmailTemplate(emailToken)
        );

        return result;
    }

    // generate tokens
    private async generateTokens(
        userId: string,
        email: string
    ) : Promise<{ accessToken: string, refreshToken: string, refreshId: string }> {
        const payload = {sub: userId, email};

        const refreshId = randomBytes(16).toString('hex');
        
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {expiresIn: '15m'}),
            this.jwtService.signAsync({
                sub: userId,
                email,
                sid: refreshId
                },
                { expiresIn: '7d' }
            )
        ]);


        return {refreshId, accessToken, refreshToken}
    };

    // update refresh token
    private async updateRefreshToken( sessionId: string, refreshToken: string ): Promise<void> {
        // Hash refresh token
        const refreshTokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);

        // update session
        await this.prisma.userSession.update({
            where: { id: sessionId },
            data: {
                refreshTokenHash,
            }
        })

    }

    // refresh tokens
    async refreshToken(jwtPayload: JwtPayloadType): Promise<AuthResponseDto> {
        const userId = jwtPayload.id;
        const sessionId = jwtPayload.sid

        // generate tokens
        const {accessToken, refreshToken} = await this.generateTokens(userId, jwtPayload.email);
        
        // update refresh token in db
        await this.updateRefreshToken(sessionId ,refreshToken);

        // get user data
        const user = await this.prisma.user.findUnique({
            where: { id: jwtPayload.id },
            select: userBaseSelect
        });

        if(!user) {
            throw new NotFoundException('User not found');
        }

        return {
            refreshToken,
            accessToken,
            user
        }
    }


    // logout
    async logout(sessionId: string): Promise<void> {
        await this.prisma.userSession.delete({
            where: {id: sessionId},
        })
    }
    
    // login
    async login(
        loginDto: LoginDto,
        sessionMeta: SessionMetaDto): Promise<AuthResponseDto> {
        
        // extract data
        const {email, password} = loginDto;

        // check if user exist
        const existingUser = await this.prisma.user.findUnique({
            where: {email}
        });

        if(!existingUser) {
            throw new NotFoundException('User with this email not found');
        }

        // compare password
        const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash);

        if(!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // generate tokens
        const {refreshId, accessToken, refreshToken} = 
            await this.generateTokens(existingUser.id, existingUser.email);

        // hash refresh token 
        const refreshTokenHash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
        
        // create session
        const expiresAt = new Date(Date.now() + 7*24*60*60*1000);
        const ipAddress = sessionMeta.ipAddress;
        const userAgent = sessionMeta.userAgent;

        await this.prisma.userSession.create({
            data: {
                id: refreshId,
                userId: existingUser.id,
                refreshTokenHash,
                ipAddress,
                userAgent,
                expiresAt
            }
        });

        return {
            refreshToken,
            accessToken,
            user: existingUser
        }

    }

    // change password
    async changePassword(
        userId: string,
        changePassword: ChangePasswordDto): Promise<void> {
            // extract data
            const {currentPassword, newPassword} = changePassword;

            // get user
            const user = await this.prisma.user.findUnique({
                where: {id: userId},
                select: {passwordHash: true}
            });

            if(!user) {
                throw new NotFoundException('User not found');
            }

            // compare password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

            if(!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            // hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

            // update password 
            await this.prisma.user.update({
                where: {id: userId},
                data: {
                    passwordHash: newPasswordHash
                }
            });

            return;
        }

        // verify email
        async verifyEmail(token: string): Promise<void> {
            // get user id from payload 
            const payload = await this.jwtService.verify(token);
            const userId = payload.sub;

            // get user
            const existingUser = await this.prisma.user.findUnique({
                where: {id: userId},
                select: userBaseSelect
            });

            if(!existingUser) {
                throw new NotFoundException('User not found');
            }

            if(existingUser?.isEmailVerified) {
                throw new UnauthorizedException('Email already verified');
            }

            // activate user
            await this.prisma.user.update({
                where: {id: existingUser.id},
                data: {
                    isEmailVerified: true
                }
            })

            return;
        }


        // forgot password
        async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{message: string}> {
            const {email} = forgotPasswordDto;

            const existingUser = await this.prisma.user.findUnique({
                where: {email}
            });

            if(!existingUser) {
                return { message: 'If email exists, reset link was sent'};
            };

            // generate email token
            const emailToken = await this.jwtService.signAsync(
                {sub: existingUser.id},
                {expiresIn: '15m'}
            );

            await this.mailService.sendMail(
                existingUser.email,
                'Reset your password',
                resetPasswordTemplate(emailToken)
            );

            return { message: 'If email exists, reset link was sent' };
        }


        // reset password
        async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
            const {token, newPassword} = resetPasswordDto;

            // get user id 
            const payload = await this.jwtService.verify(token);
            const userId = payload.sub;

            // get user
            const existingUser = await this.prisma.user.findUnique({
                where: {id: userId}
            });

            if(!existingUser) {
                throw new UnauthorizedException('User not found');
            }

            // hash password
            const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

            // update password
            await this.prisma.user.update({
                where: {id: existingUser.id},
                data: {
                    passwordHash: newPasswordHash
                }
            });

            return;
        }
}
