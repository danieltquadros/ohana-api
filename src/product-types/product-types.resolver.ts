import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductTypesService } from './product-types.service';
import { ProductType } from './entities/product-type.entity';
import { CreateProductTypeInput } from './dto/create-product-type.input';
import { UpdateProductTypeInput } from './dto/update-product-type.input';

@Resolver(() => ProductType)
export class ProductTypesResolver {
  constructor(private readonly productTypesService: ProductTypesService) {}

  @Mutation(() => ProductType)
  createProductType(
    @Args('createProductTypeInput')
    createProductTypeInput: CreateProductTypeInput,
  ) {
    return this.productTypesService.create(createProductTypeInput);
  }

  @Query(() => [ProductType], { name: 'productTypes' })
  findAll() {
    return this.productTypesService.findAll();
  }

  @Query(() => ProductType, { name: 'productType', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productTypesService.findOne(id);
  }

  @Mutation(() => ProductType)
  updateProductType(
    @Args('updateProductTypeInput')
    updateProductTypeInput: UpdateProductTypeInput,
  ) {
    return this.productTypesService.update(
      updateProductTypeInput.id,
      updateProductTypeInput,
    );
  }

  @Mutation(() => ProductType)
  removeProductType(@Args('id', { type: () => Int }) id: number) {
    return this.productTypesService.remove(id);
  }
}
