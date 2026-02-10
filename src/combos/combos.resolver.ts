import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CombosService } from './combos.service';
import { Combo } from './entities/combo.entity';
import { CreateComboInput } from './dto/create-combo.input';
import { UpdateComboInput } from './dto/update-combo.input';

@Resolver(() => Combo)
export class CombosResolver {
  constructor(private readonly combosService: CombosService) {}

  @Mutation(() => Combo)
  createCombo(@Args('createComboInput') createComboInput: CreateComboInput) {
    return this.combosService.create(createComboInput);
  }

  @Query(() => [Combo], { name: 'combos' })
  findAll() {
    return this.combosService.findAll();
  }

  @Query(() => [Combo], { name: 'activeCombos' })
  findActive() {
    return this.combosService.findActive();
  }

  @Query(() => Combo, { name: 'combo' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.combosService.findOne(id);
  }

  @Mutation(() => Combo)
  updateCombo(@Args('updateComboInput') updateComboInput: UpdateComboInput) {
    return this.combosService.update(updateComboInput.id, updateComboInput);
  }

  @Mutation(() => Combo)
  removeCombo(@Args('id', { type: () => Int }) id: number) {
    return this.combosService.remove(id);
  }
}
