import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get('all')
  async findAll(): Promise<any> {
    return this.ordersService.findAll();
  }
  @Get('order/:id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.ordersService.findById(id);
  }
  @Get('user/:id')
  async findByUserId(@Param('id') id: string): Promise<any> {
    return this.ordersService.findByUserId(id);
  }
  @Post('create')
  async create(@Body() createOrderDto: any): Promise<any> {
    return this.ordersService.create(createOrderDto);
  }
  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: any,
  ): Promise<any> {
    return this.ordersService.update(id, updateOrderDto);
  }
  @Delete('delete/:id')
  async remove(@Param('id') id: string): Promise<any> {
    return this.ordersService.delete(id);
  }
}
