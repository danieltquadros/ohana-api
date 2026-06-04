import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { PrismaService } from '../prisma/prisma.service';
import { toSlug } from '../common/utils/slug.util';

@Injectable()
export class ProductTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productType.findMany();
  }

  async findOne(id: number) {
    return this.prisma.productType.findUnique({
      where: { id },
    });
  }

  async create(createProductTypeDto: CreateProductTypeDto) {
    const name = toSlug(createProductTypeDto.label);

    const existing = await this.prisma.productType.findUnique({
      where: { name },
    });
    if (existing) {
      throw new ConflictException(
        `Já existe um tipo de produto com nome técnico "${name}" (gerado a partir do label "${createProductTypeDto.label}").`,
      );
    }

    return this.prisma.productType.create({
      data: { ...createProductTypeDto, name },
    });
  }

  async update(id: number, updateProductTypeDto: UpdateProductTypeDto) {
    // `name` é imutável após criação — só `label` e `isActive` podem mudar
    return this.prisma.productType.update({
      where: { id },
      data: updateProductTypeDto,
    });
  }

  async remove(id: number) {
    const productType = await this.findOne(id);

    if (!productType) {
      throw new NotFoundException(`Product type with ID ${id} not found`);
    }

    const [activeProducts, inactiveProducts, menuSection] = await Promise.all([
      this.prisma.product.count({
        where: { productTypeId: id, isActive: true },
      }),
      this.prisma.product.count({
        where: { productTypeId: id, isActive: false },
      }),
      this.prisma.menuSection.findUnique({
        where: { productTypeId: id },
      }),
    ]);

    if (activeProducts > 0 || inactiveProducts > 0) {
      const parts: string[] = [];
      if (activeProducts > 0) parts.push(`${activeProducts} ativo(s)`);
      if (inactiveProducts > 0) parts.push(`${inactiveProducts} inativo(s)`);
      throw new ConflictException(
        `Não é possível excluir este tipo de produto pois está sendo usado em ${parts.join(' e ')} produto(s). Exclua os produtos primeiro.`,
      );
    }

    if (menuSection) {
      throw new ConflictException(
        `Não é possível excluir este tipo de produto pois está vinculado à seção de menu "${menuSection.label}". Remova a seção primeiro.`,
      );
    }

    return this.prisma.productType.delete({
      where: { id },
    });
  }
}
