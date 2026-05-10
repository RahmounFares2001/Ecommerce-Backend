import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { userBaseSelect } from "src/users/users.selects";


@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',            
        })
    }    


    async validate(payload: {sub: string, email: string}) {
        const user = await this.prisma.user.findUnique({
            where: { id : payload.sub },
            select: {
                id: true,
                email: true
            }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {...user};
    }
   
}