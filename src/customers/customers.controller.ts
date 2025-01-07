import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}
  @Get()
  getAllCustomers(): any {
    return this.customersService.findAll();
  }
  @Post('create')
  createCustomer(@Body() createCustomerDto: any): any {
    return this.customersService.create(createCustomerDto);
  }
  @Get(':id')
  getCustomerById(@Param('id') id: string): any {
    return this.customersService.findById(id);
  }
  @Put(':id')
  updateCustomer(@Param('id') id: string, @Body() updateCustomerDto: any): any {
    return this.customersService.update(id, updateCustomerDto);
  }
  @Delete(':id')
  deleteCustomer(@Param('id') id: string): any {
    return this.customersService.delete(id);
  }
}
