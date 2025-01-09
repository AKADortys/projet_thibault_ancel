import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}
  @Get('all')
  getAllCustomers(): any {
    return this.customersService.findAll();
  }
  @Post('create')
  createCustomer(@Body() createCustomerDto: any): any {
    return this.customersService.create(createCustomerDto);
  }
  @Get('customer/:id')
  getCustomerById(@Param('id') id: string): any {
    return this.customersService.findById(id);
  }
  @Get('email/:email')
  getCustomerByEmail(@Param('email') email: string): any {
    return this.customersService.findByMail(email);
  }
  @Put('update/:id')
  updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: any,
    @Req() req: Request & { user: any },
  ): any {
    const user = req.user;
    console.log('Modification de: ', user);
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete('delete/:id')
  deleteCustomer(@Param('id') id: string): any {
    return this.customersService.delete(id);
  }
}
