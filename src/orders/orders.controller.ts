import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrderStatus } from './entities/order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('BUYER','Buyer')
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id, req.user.role);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body('status') status: OrderStatus
  ) {
    return this.ordersService.updateStatus(+id, req.user.id, req.user.role, status);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN','Admin')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
