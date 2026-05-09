import { ConflictException, Injectable, NotFoundException, Res } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

import * as bcrypt from 'bcrypt';
import { userBaseSelect } from 'src/users/users.selects';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { SessionMetaDto } from 'src/common/dto/session-meta.dto';

@Injectable()
export class AuthService {
    private SALT_ROUNDS = 12;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
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
        ])

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
    async refreshToken( oldRefreshToken: string ): Promise<AuthResponseDto> {
        
        // get sessionId
        const payload = this.jwtService.verify(oldRefreshToken);
        const sessionId = payload.sid;

        // find user
        const userId = payload.sub
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: userBaseSelect
        });

        if(!user) {
            throw new NotFoundException('User not found');
        }

        // generate tokens
        const {accessToken, refreshToken} = await this.generateTokens(user.id, user.email);
        
        // update refresh token in db
        await this.updateRefreshToken(sessionId ,refreshToken);

        return {
            accessToken,
            user
        }
    }


    // logout
    async logout(refreshToken: string): Promise<void> {
        const payload = this.jwtService.verify(refreshToken);

        const sessionId = payload.sid;

        await this.prisma.userSession.delete({
            where: {id: sessionId},
        })
    }
}
