import { Offer, Prisma, OfferKind, OfferScope } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

describe('OffersService', () => {
  let service: OffersService;

  const mockPrismaService = {
    offer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    offerProduct: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    offerCombo: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    offerCategory: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    offerProductType: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const makeMockOffer = (overrides: Partial<Offer> = {}): Offer => ({
    id: 1,
    label: 'Test Offer',
    description: 'Test Description',
    kind: OfferKind.PERCENTAGE,
    scope: OfferScope.CART_TOTAL,
    percentage: new Prisma.Decimal('10.00'),
    fixedAmount: null,
    minOrderValue: null,
    maxDiscountValue: null,
    validFrom: null,
    validUntil: null,
    daysOfWeek: [],
    priority: 0,
    stackable: false,
    isActive: true,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    createdBy: null,
    updatedBy: null,
    ...overrides,
  });

  // Pra mock com pivots (quando necessário):
  const makeMockOfferWithRelations = (overrides: Partial<Offer> = {}) => ({
    ...makeMockOffer(overrides),
    products: [],
    combos: [],
    categories: [],
    productTypes: [],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new offer', async () => {
      const createOfferDto: CreateOfferDto = {
        label: 'New Offer',
        description: 'New Description',
        kind: OfferKind.PERCENTAGE,
        scope: OfferScope.CART_TOTAL,
        percentage: 15,
      };

      const expectedOffer = makeMockOffer({
        label: createOfferDto.label,
        description: createOfferDto.description,
        kind: createOfferDto.kind,
        scope: createOfferDto.scope,
        percentage: new Prisma.Decimal('15.00'),
      });

      mockPrismaService.offer.create.mockResolvedValue(expectedOffer);

      const result = await service.create(createOfferDto);

      expect(result).toEqual(expectedOffer);
      expect(mockPrismaService.offer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(createOfferDto),
          include: expect.any(Object),
        }),
      );
      expect(mockPrismaService.offer.create).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // validateCoherence — testado via create() porque é privado.
  //
  // Padrão de teste de exceção:
  //   1. Monta DTO INVÁLIDO propositalmente
  //   2. Verifica que a chamada REJEITA com a exceção certa (via .rejects.toThrow)
  //   3. Verifica que NÃO chegou a chamar Prisma (curto-circuito antes)
  //
  // Ponto conceitual: essas assertions provam DUAS coisas — que a validação
  // funciona (rejeita) E que ela roda ANTES do Prisma (fail-fast).
  // ==========================================================================
  describe('validateCoherence (via create)', () => {
    it('rejects PERCENTAGE without percentage', async () => {
      const invalidDto = {
        label: 'Invalid',
        kind: OfferKind.PERCENTAGE,
        scope: OfferScope.CART_TOTAL,
        // percentage AUSENTE propositalmente
      } as CreateOfferDto;

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      // rejects.toThrow(string) verifica que a mensagem CONTÉM o texto.
      // Não precisa ser a mensagem inteira.
      await expect(service.create(invalidDto)).rejects.toThrow(
        'percentage é obrigatório',
      );

      // Prova que o service NUNCA chegou a chamar o Prisma
      expect(mockPrismaService.offer.create).not.toHaveBeenCalled();
    });

    it('rejects FIXED_AMOUNT without fixedAmount', async () => {
      const invalidDto = {
        label: 'Invalid',
        kind: OfferKind.FIXED_AMOUNT,
        scope: OfferScope.CART_TOTAL,
        // fixedAmount ausente
      } as CreateOfferDto;

      await expect(service.create(invalidDto)).rejects.toThrow(
        'fixedAmount é obrigatório',
      );
      expect(mockPrismaService.offer.create).not.toHaveBeenCalled();
    });

    it('rejects FREE_SHIPPING with percentage set', async () => {
      const invalidDto: CreateOfferDto = {
        label: 'Invalid',
        kind: OfferKind.FREE_SHIPPING,
        scope: OfferScope.CART_TOTAL,
        percentage: 5, // não deveria ter valor com FREE_SHIPPING
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        'FREE_SHIPPING não usa percentage nem fixedAmount',
      );
    });

    it('rejects scope=PRODUCT without productIds', async () => {
      const invalidDto: CreateOfferDto = {
        label: 'Invalid',
        kind: OfferKind.PERCENTAGE,
        scope: OfferScope.PRODUCT,
        percentage: 10,
        // productIds ausente/vazio → viola a regra do scope
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        'scope=PRODUCT exige pelo menos 1 productId',
      );
    });

    it('rejects scope=CART_TOTAL with productIds', async () => {
      const invalidDto: CreateOfferDto = {
        label: 'Invalid',
        kind: OfferKind.PERCENTAGE,
        scope: OfferScope.CART_TOTAL,
        percentage: 10,
        productIds: [1, 2], // não deveria ter targets com scope CART_TOTAL
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        'scope=CART_TOTAL não deve ter targets específicos',
      );
    });
  });

  // ==========================================================================
  // findAll — 2 cenários que provam o comportamento do filtro isActive.
  //
  // Ponto conceitual: o service tem UM parâmetro (includeInactive) que muda
  // o WHERE do Prisma. Cada teste isola um estado desse parâmetro e verifica
  // que o Prisma foi chamado com o filtro certo.
  // ==========================================================================
  describe('findAll', () => {
    it('filters isActive=true by default', async () => {
      mockPrismaService.offer.findMany.mockResolvedValue([]);

      await service.findAll();

      // Verifica que findMany foi chamado com where isActive=true
      // (default do service quando includeInactive não vem)
      expect(mockPrismaService.offer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });

    it('returns all offers when includeInactive=true', async () => {
      mockPrismaService.offer.findMany.mockResolvedValue([]);

      await service.findAll(true);

      // includeInactive=true → where DEVE ser undefined (sem filtro)
      expect(mockPrismaService.offer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: undefined,
        }),
      );
    });
  });

  // ==========================================================================
  // findOne — retorno normal + NotFoundException.
  //
  // Ponto conceitual: mesmo método tem 2 caminhos (feliz e triste). Cada
  // caminho é 1 teste. O mock decide qual caminho executar retornando um
  // valor ou null.
  // ==========================================================================
  describe('findOne', () => {
    it('returns the offer when it exists', async () => {
      const mockOffer = makeMockOfferWithRelations();
      mockPrismaService.offer.findUnique.mockResolvedValue(mockOffer);

      const result = await service.findOne(1);

      expect(result).toEqual(mockOffer);
      expect(mockPrismaService.offer.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          include: expect.any(Object),
        }),
      );
    });

    it('throws NotFoundException when offer does not exist', async () => {
      // Mock retorna null → service deve lançar NotFoundException
      mockPrismaService.offer.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Offer with ID 999 not found',
      );
    });
  });

  // ==========================================================================
  // remove — snapshot pré-delete + NotFoundException.
  //
  // Ponto conceitual: o service faz findOne ANTES do delete pra retornar o
  // estado completo (com pivots). O teste prova essa sequência.
  // ==========================================================================
  describe('remove', () => {
    it('returns pre-delete snapshot', async () => {
      const mockOffer = makeMockOfferWithRelations();
      // findOne retorna a offer (snapshot antes do delete)
      mockPrismaService.offer.findUnique.mockResolvedValue(mockOffer);
      // delete é chamado, mas o valor retornado por ele NÃO é usado
      mockPrismaService.offer.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      // O retorno DEVE ser o snapshot do findOne (não o do delete)
      expect(result).toEqual(mockOffer);
      expect(mockPrismaService.offer.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws NotFoundException when offer does not exist', async () => {
      mockPrismaService.offer.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);

      // Delete NÃO deve ter sido chamado (fail-fast antes)
      expect(mockPrismaService.offer.delete).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // update — 3 cenários que provam:
  //   1. 404 quando offer não existe
  //   2. Não mexe nas pivots quando *Ids são undefined (update parcial)
  //   3. Deleta e recria pivots quando *Ids vieram no payload
  //
  // Ponto conceitual: o service usa $transaction pro update. O mock do
  // $transaction (no topo do arquivo) executa o callback com mockPrismaService
  // como "tx" — assim os asserts em tx.offerProduct.deleteMany funcionam.
  // ==========================================================================
  describe('update', () => {
    it('throws NotFoundException when offer does not exist', async () => {
      mockPrismaService.offer.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { label: 'X' })).rejects.toThrow(
        NotFoundException,
      );

      // Nem update nem deleteMany nas pivots devem ter sido chamados
      expect(mockPrismaService.offer.update).not.toHaveBeenCalled();
      expect(mockPrismaService.offerProduct.deleteMany).not.toHaveBeenCalled();
    });

    it('does NOT touch pivots when *Ids are undefined (partial update)', async () => {
      // Setup: offer existe (findOne passa), update retorna offer atualizada
      const existingOffer = makeMockOfferWithRelations();
      const updatedOffer = makeMockOfferWithRelations({ label: 'Novo Label' });
      mockPrismaService.offer.findUnique.mockResolvedValue(existingOffer);
      mockPrismaService.offer.update.mockResolvedValue(updatedOffer);

      const partialDto: UpdateOfferDto = { label: 'Novo Label' };
      // Nenhum *Ids no payload → não deve mexer em pivots
      await service.update(1, partialDto);

      // As 4 deleteMany das pivots NÃO devem ter rodado
      expect(mockPrismaService.offerProduct.deleteMany).not.toHaveBeenCalled();
      expect(mockPrismaService.offerCombo.deleteMany).not.toHaveBeenCalled();
      expect(mockPrismaService.offerCategory.deleteMany).not.toHaveBeenCalled();
      expect(
        mockPrismaService.offerProductType.deleteMany,
      ).not.toHaveBeenCalled();

      // Update foi chamado 1 vez com o label novo
      expect(mockPrismaService.offer.update).toHaveBeenCalledTimes(1);
    });

    it('deletes and recreates product pivots when productIds provided', async () => {
      const existingOffer = makeMockOfferWithRelations({
        scope: OfferScope.PRODUCT,
      });
      const updatedOffer = makeMockOfferWithRelations();
      mockPrismaService.offer.findUnique.mockResolvedValue(existingOffer);
      mockPrismaService.offer.update.mockResolvedValue(updatedOffer);

      const dto: UpdateOfferDto = {
        scope: OfferScope.PRODUCT,
        productIds: [10, 20],
      };
      await service.update(1, dto);

      // deleteMany DEVE ter sido chamado nos pivots de produto
      expect(mockPrismaService.offerProduct.deleteMany).toHaveBeenCalledWith({
        where: { offerId: 1 },
      });

      // Update DEVE ter sido chamado incluindo a instrução `create` na relação products
      expect(mockPrismaService.offer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            products: { create: [{ productId: 10 }, { productId: 20 }] },
          }),
        }),
      );
    });
  });
});
