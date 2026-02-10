import { PartialType } from '@nestjs/mapped-types';
import { CreateComboProductSubstitutionDto } from './create-combo-product-substitution.dto';

export class UpdateComboProductSubstitutionDto extends PartialType(
  CreateComboProductSubstitutionDto,
) {}
