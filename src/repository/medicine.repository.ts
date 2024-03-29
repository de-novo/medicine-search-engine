import { Injectable } from '@nestjs/common';
import { Prisma, medicine } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';
import { Medicine } from '@src/type/medicine.type';
import { Page } from '@src/type/page';
import { SelectAll } from '@src/utils/excludeField';
import typia from 'typia';

@Injectable()
export class MedicineRepository {
  constructor(private readonly prisma: PrismaService) {}

  //////////////////////////////////////////
  // default
  //////////////////////////////////////////
  findUnique(id: string, tx?: PrismaTxType) {
    return (tx ?? this.prisma).medicine.findUnique({
      where: {
        id,
      },
      select: {
        ...(typia.random<
          SelectAll<Medicine, true>
        >() satisfies Prisma.medicineFindUniqueArgs['select']),
      },
    });
  }

  findUniqueDetail(id: string, tx?: PrismaTxType) {
    return (tx ?? this.prisma).medicine.findUnique({
      where: {
        id,
      },
      select: {
        ...(typia.random<
          SelectAll<Medicine.Detail, true>
        >() satisfies Prisma.medicineFindUniqueArgs['select']),
      },
    });
  }

  findMany(
    { page, limit }: Required<Pick<Page.Search, 'page' | 'limit'>>,
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).medicine.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        ...(typia.random<
          SelectAll<Medicine, true>
        >() satisfies Prisma.medicineFindManyArgs['select']),
      },
    });
  }

  count(tx?: PrismaTxType) {
    return (tx ?? this.prisma).medicine.count();
  }

  //////////////////////////////////////////
  // search
  //////////////////////////////////////////
  async findManyByIntegredientCode(
    ingredient_code: string,
    { page, limit }: Required<Page.Query>,
    tx?: PrismaTxType,
  ) {
    const medicines = (await (tx ?? this.prisma).medicine.findRaw({
      filter: {
        'main_ingredients.code': ingredient_code,
      },
      options: {
        skip: (page - 1) * limit,
        limit,
        projection: {
          ...typia.random<SelectAll<Medicine, 1>>(),
          id: '$_id',
          _id: 0,
        },
      },
    })) as unknown as Medicine[];
    return medicines;
  }

  async countByIntegredientCode(ingredient_code: string, tx?: PrismaTxType) {
    const result = (await (tx ?? this.prisma).medicine.aggregateRaw({
      pipeline: [
        {
          $match: {
            'main_ingredients.code': ingredient_code,
          },
        },
        {
          $count: 'count',
        },
      ],
    })) as unknown as { count: number }[];
    if (result.length === 0) return 0;
    const count = result[0].count;

    return count;
  }

  async aggregateSearch(
    {
      search,
      page,
      limit,
      path,
    }: Required<Page.Search> & {
      path: ('name' | 'english_name' | 'ingredients.ko' | 'ingredients.en')[];
    },
    searchOption?: {
      fuzzy?: {
        maxEdits: number;
      };
    },
  ) {
    const searchParam = {
      index: 'medicine',
      text: {
        query: search,
        path,
        ...(searchOption?.fuzzy
          ? {
              fuzzy: searchOption.fuzzy,
            }
          : {}),
      },
      count: {
        type: 'total',
      },
    };
    console.log(searchParam);

    const $project = {
      $project: {
        ...typia.random<SelectAll<Medicine, 1>>(),
        id: '$_id',
      },
    };

    const data = (await this.prisma.medicine.aggregateRaw({
      pipeline: [
        {
          $search: searchParam,
        },
        { ...$project },
        { $skip: (page - 1) * limit },
        {
          $limit: limit,
        },
      ],
    })) as unknown as Omit<
      medicine,
      'document' | 'usage' | 'effect' | 'change_content' | 'caution'
    >[];
    return data;
  }

  async aggregateSearchCount(
    {
      search,
      path,
    }: Required<Pick<Page.Search, 'search'>> & {
      path: ('name' | 'english_name' | 'ingredients.ko' | 'ingredients.en')[];
    },
    searchOption?: {
      fuzzy?: {
        maxEdits: number;
      };
    },
  ) {
    const searchParam = {
      index: 'medicine',
      text: {
        query: search,
        path,
        ...(searchOption?.fuzzy
          ? {
              fuzzy: searchOption.fuzzy,
            }
          : {}),
      },
      count: {
        type: 'total',
      },
    };

    const count = (await this.prisma.medicine.aggregateRaw({
      pipeline: [
        {
          $searchMeta: searchParam,
        },
      ],
    })) as unknown as [{ count: { total: number } }];

    return count[0].count.total;
  }

  async aggregateKeyword({
    search,
    path,
    page,
    limit,
  }: Required<Page.Search> & {
    path: 'name' | 'english_name';
  }) {
    const searchParam = {
      index: 'autocomplete',
      autocomplete: {
        query: search,
        path: path,
        tokenOrder: 'sequential',
      },
      count: {
        type: 'total',
      },
    };

    const data = (await this.prisma.medicine.aggregateRaw({
      pipeline: [
        {
          $search: searchParam,
        },
        {
          $project: {
            _id: 0,
            keyword: `$${path}`,
          },
        },
        { $skip: (page - 1) * limit },
        {
          $limit: limit,
        },
      ],
    })) as unknown as { keyword: string }[];
    return data;
  }
}
