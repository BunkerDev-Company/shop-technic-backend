import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ProductsController } from './controllers/products.controller';

import { ListProductsHandler } from './application/handlers/list-products.handler';

import { PrismaService } from './infrastructure/prisma/prisma.service';

const CommandHandlers = [];

const QueryHandlers = [ListProductsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ProductsController],
  providers: [PrismaService, ...CommandHandlers, ...QueryHandlers],
})
export class AppModule {}
