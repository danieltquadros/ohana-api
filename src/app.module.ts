import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductTypesModule } from './product-types/product-types.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    // GraphQL configuration - Code First approach
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true, // Habilitar GraphQL Playground em desenvolvimento
    }),
    PrismaModule, // Registra o Prisma primeiro
    ProductsModule,
    ProductTypesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
