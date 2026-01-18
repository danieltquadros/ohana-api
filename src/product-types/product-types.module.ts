import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { ProductTypesResolver } from './product-types.resolver';

@Module({
  controllers: [ProductTypesController],
  providers: [ProductTypesService, ProductTypesResolver],
})
export class ProductTypesModule {}
