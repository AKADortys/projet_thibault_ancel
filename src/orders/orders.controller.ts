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

  @Post('create')
  async create(@Body() createOrderDto: any): Promise<any> {
    return this.ordersService.create(createOrderDto);
  }
}
