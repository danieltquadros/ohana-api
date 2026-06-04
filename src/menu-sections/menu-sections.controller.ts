import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MenuSectionsService } from './menu-sections.service';
import { CreateMenuSectionDto } from './dto/create-menu-section.dto';
import { UpdateMenuSectionDto } from './dto/update-menu-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('menu-sections')
export class MenuSectionsController {
  constructor(private readonly menuSectionsService: MenuSectionsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateMenuSectionDto) {
    return this.menuSectionsService.create(dto);
  }

  @Get()
  findAll(
    @Query('includeInactive') includeInactive?: string,
    @Query('withContent') withContent?: string,
  ) {
    return this.menuSectionsService.findAll(
      includeInactive === 'true',
      withContent === 'true',
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuSectionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuSectionDto,
  ) {
    return this.menuSectionsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuSectionsService.remove(id);
  }
}
