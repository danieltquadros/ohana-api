import { Module } from '@nestjs/common';
import { CombosService } from './combos.service';
import { CombosController } from './combos.controller';
import { CombosResolver } from './combos.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CombosController],
  providers: [CombosService, CombosResolver],
  exports: [CombosService],
})
export class CombosModule {}
