import { createParamDecorator,ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const RefreshToken = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();

        const refreshToken = request.cookie?.refreshToken;

        if(!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        return refreshToken;
    }
)