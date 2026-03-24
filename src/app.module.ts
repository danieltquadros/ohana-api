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
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // GraphQL configuration - Code First approach
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production', // Desabilita Apollo Sandbox em PRD
    }),
    PrismaModule, // Registra o Prisma primeiro
    AuthModule, // Authentication module
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
