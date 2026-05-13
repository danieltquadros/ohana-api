import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductTypesModule } from './product-types/product-types.module';
import { CategoriesModule } from './categories/categories.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { CombosModule } from './combos/combos.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProductsModule,
    ProductTypesModule,
    CategoriesModule,
    IngredientsModule,
    CombosModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
