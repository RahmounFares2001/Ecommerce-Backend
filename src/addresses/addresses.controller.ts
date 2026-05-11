import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { ApiOperation } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AddressResponseDto } from './dto/address-response.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

    // get addresses
    @Get('me')
    @UseGuards(AccessTokenGuard)
    @ApiOperation({summary: 'Get user address'})
    async getAllAddresses(@Req() req: any): Promise<AddressResponseDto[]> {
      const userId = req.user.id;

      return await this.addressesService.getAllAddresses(userId);
    }

    // get single address
    @Get(':id')
    @UseGuards(AccessTokenGuard)
    @ApiOperation({summary: 'Get user address'})
    async getSingleAddress(@Param('id') addressId: string): Promise<AddressResponseDto> {
      return await this.addressesService.getSingleAddress(addressId);
    }

    // add address
    @Post('me')
    @UseGuards(AccessTokenGuard)
    @ApiOperation({summary:'Add user address'})
    async createAddress(
      @Body() createAddressDto: CreateAddressDto,
      @Req() req: any
    ): Promise<AddressResponseDto> {
      const userId = req.user.id;

      return await this.addressesService.createAddress(userId, createAddressDto);
    }

    // update address
    @Patch(':id')
    @UseGuards(AccessTokenGuard)
    @ApiOperation({summary:'Update user address'})
    async updateAddress(
      @Param('id') addressId: string,
      @Body() updateAdressDto: UpdateAddressDto,
      @Req()  req: any
    ): Promise<AddressResponseDto> {
      const userId = req.user.id;
      return await this.addressesService.updateAddress(userId, addressId, updateAdressDto);
    }

    // delete address
    @Delete(':id')
    @UseGuards(AccessTokenGuard)
    @ApiOperation({summary:'Delete user address'})
    async deleteAddress(
      @Param('id') addressId: string,
      @Req() req: any ) {
      
      const userId = req.user.id;
      return await this.addressesService.deleteAddress(userId, addressId);
    }

}
