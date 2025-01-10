import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('all')
  async findAll(): Promise<any[]> {
    return await this.productsService.findAll();
  }

  @Get('product/:id')
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.productsService.findById(id);
  }

  @Post('create')
  async create(@Body() createProductDto: any): Promise<any> {
    return await this.productsService.create(createProductDto);
  }

  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: any,
  ): Promise<any> {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string): Promise<any> {
    return await this.productsService.delete(id);
  }
}
