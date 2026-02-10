import { PartialType } from '@nestjs/mapped-types';
import { CreateComboProductDto } from './create-combo-product.dto';

export class UpdateComboProductDto extends PartialType(CreateComboProductDto) {}
