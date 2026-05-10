import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from 'bcrypt'
import { userBaseSelect } from "src/users/users.selects";


@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT-REFRESH-SECRET') || 'jwt-refresh2026',
            // allows validate to receive the full request object
            passReqToCallback: true
        })
    }

    // validate 
    async validate(
        req: Request,
        payload: { sub: string, email: string, sid: string }) {
            
        console.log('RefreshTokenStrategy.validate called');

        const authHeader = req.headers.authorization;
        if(!authHeader) {
            console.log('No authorization header found');
            throw new UnauthorizedException('Refresh token not provided');
        }

        const refreshToken = authHeader.replace('Bear ', '').trim();
        if(!refreshToken) {
            console.log('No authorization header found');
            throw new UnauthorizedException(
                'Refresh token is empty after extraction'
            );
        }

        const user = await this.prisma.user.findUnique({
            where: {id: payload.sub},
            select: {
                id: true,
                email: true
            }
        });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // get session
        const userSession = await this.prisma.userSession.findUnique({
            where: { id: payload.sid },
            select: {
                id: true,
                refreshTokenHash: true
            }
        });

        if (!userSession) {
            throw new UnauthorizedException('Session not found');
        };

        const refreshTokenMaches = await bcrypt.compare(refreshToken, userSession.refreshTokenHash);

        if(!refreshTokenMaches) {
            throw new UnauthorizedException('Invalid refresh does not match');
        }
 
        return {
            sid: payload.sid,
            id: user.id,
            email: user.email,
        }        

    }
}