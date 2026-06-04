import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateProductTypeDto {
  @IsString()
  label!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
