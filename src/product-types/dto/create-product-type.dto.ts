import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateProductTypeDto {
  @IsString()
  name!: string;

  @IsString()
  label!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
