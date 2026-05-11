import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressResponseDto } from './dto/address-response.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
    constructor(
        private prisma: PrismaService
    ) {

    }

    // get all addresses
    async getAllAddresses(userId: string): Promise<AddressResponseDto[]> {
        const addresses = await this.prisma.address.findMany({
            where: {userId}
        });

        if(addresses.length === 0) {
            throw new NotFoundException('User dont have address');
        };

        return addresses;
    }

    // get single address
    async getSingleAddress(addressId: string): Promise<AddressResponseDto> {
        const address = await this.prisma.address.findUnique({
            where: {id: addressId}
        });

        if(!address) {
            throw new NotFoundException('User dont have address');
        };

        return address;
    }

    // create address
    async createAddress(
        userId: string, 
        createAddressDto: CreateAddressDto): Promise<AddressResponseDto> {

            // handle default address
            if(createAddressDto.isDefault) {
                await this.prisma.address.updateMany({
                    where: { userId },
                    data: { isDefault: false }
                })
            }
            const address = await this.prisma.address.create({
                data: {
                    ...createAddressDto,
                    userId
                }
            });

            return address;
    };

    // update address
    async updateAddress(
        userId: string,
        addressId: string,
        updateAddressDto: UpdateAddressDto
    ): Promise<AddressResponseDto> {

        // ensure address belongs to user
        const address = await this.prisma.address.findFirst({
            where: {
            id: addressId,
            userId,
            deletedAt: null,
            },
        });

        if (!address) {
            throw new NotFoundException('Address not found');
        }
        
        // handle default address
        if(updateAddressDto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }

        // update address
        const updatedAddress = await this.prisma.address.update({
            where: { id: addressId },
            data: {
                ...updateAddressDto,
            }
        });

        return updatedAddress;
    }

    // delete address
    async deleteAddress(userId: string, addressId: string) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
          
        if (!address) {
            throw new NotFoundException('Address not found');
        } 

        await this.prisma.address.delete({
            where: {
                id: addressId,
                userId
            }
        });

        return;
    }
}
