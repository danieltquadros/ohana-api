import { registerEnumType } from '@nestjs/graphql';

export enum CategoryType {
  PRODUCT = 'PRODUCT',
  COMBO = 'COMBO',
}

registerEnumType(CategoryType, {
  name: 'CategoryType',
  description: 'Type of category: PRODUCT or COMBO',
});
