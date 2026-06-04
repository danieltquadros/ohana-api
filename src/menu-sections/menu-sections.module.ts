import { Module } from '@nestjs/common';
import { MenuSectionsService } from './menu-sections.service';
import { MenuSectionsController } from './menu-sections.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MenuSectionsController],
  providers: [MenuSectionsService],
  exports: [MenuSectionsService],
})
export class MenuSectionsModule {}
