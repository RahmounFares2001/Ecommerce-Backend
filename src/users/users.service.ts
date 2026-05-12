import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { userBaseSelect } from './users.selects';
import { toDto } from 'src/common/utils/to-dto.util';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService
    ) {

    }

    // find me
    async findMe(userId: string) : Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: userBaseSelect
        });

        if(!user) {
            throw new NotFoundException('User not found');
        }

        // mapping layer
        return toDto(UserResponseDto, user);
    }


    // update profile
    async updateProfile(
        userId: string, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
        
        // check if email exists
        if(updateProfileDto.email) {
            const isEmailExists = await this.prisma.user.findUnique({
                where: {
                    email: updateProfileDto.email,
                    NOT: { id: userId }
                }
            });
            if(isEmailExists) {
                throw new UnauthorizedException('Email already exists');
            }
        }

        
        const updatedProfile = await this.prisma.user.update({
            where: { id: userId },
            data: updateProfileDto,
            select: userBaseSelect
        })

        return updatedProfile;
    }


    // update avatar
    async updateAvatar(
        userId: string, 
        file: Express.Multer.File): Promise<{ avatarUrl: string }> {
        
        // upload new img
        const uploadResult = await this.uploadService.uploadImage(
            file,
            '/user/avatars',
            userId
        );

        // update db
        const avatarUrl = uploadResult.url;
        const publicId = uploadResult.publicId;
        await this.prisma.user.update({
            where: {id: userId},
            data: {
                avatarUrl,
                avatarPublicId: publicId,
            }
        });

        return { avatarUrl };  
    }


    // delete avatar
    async deleteAvatar(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            select: { avatarPublicId: true }
        });

        if(!user) {
            throw new NotFoundException('User not found');
        }

        // delete img
        const publicId = user.avatarPublicId;
        if(!publicId) {
            return { message: 'No avatar to delete' };
        }
        await this.uploadService.deleteImage(publicId);
        
        // update db
        await this.prisma.user.update({
            where: {id: userId},
            data: {
                avatarUrl: null,
                avatarPublicId: null
            }
        })

        return;
    }


    // delete user
    async deleteMe(userId: string) {
        await this.prisma.user.update({
            where: {id: userId},
            data: {
                isActive: false,
                deletedAt: new Date()
            }
        });

        return;
    }
}
