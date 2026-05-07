import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { userBaseSelect } from './users.selects';
import { toDto } from 'src/common/utils/to-dto';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService
    ) {

    }

    // find user
    async findOne(userId: string) : Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: userBaseSelect
        });

        if(!user) {
            throw new NotFoundException('User not found');
        }

        // mapping layer
        return toDto(UserResponseDto,user);
    }
}
