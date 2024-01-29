import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UtilProvider } from '@src/batch/util.provider';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { INGREDIENT_API_URL_BUILD } from '@src/constant/api_url';
import { Medicine } from '@src/type/batch/medicine';
import {
  bufferCount,
  catchError,
  from,
  map,
  mergeMap,
  of,
  toArray,
} from 'rxjs';

@Injectable()
export class MedicineIngredientBatchService {
  constructor(
    private readonly util: UtilProvider,
    private readonly prisma: PrismaService,
  ) {}

  batch$(sort: 'ASC' | 'DESC' = 'ASC') {
    return this.util
      .fetchOpenApiPagesType2$<Medicine.Ingredient.OpenApiDto>(
        INGREDIENT_API_URL_BUILD,
        100,
        1,
        sort,
      )
      .pipe(
        map((openApi) =>
          this.util.convertOpenApiToDto<
            Medicine.Ingredient.OpenApiDto,
            Medicine.Ingredient.Dto
          >(openApi, Medicine.Ingredient.OPEN_API_DTO_KEY_MAP),
        ),
        map((ingredient) => this.convertDtoToPrismaSchema(ingredient)),
        bufferCount(100),

        mergeMap((prismaInputs) => this.bulkUpsert$(prismaInputs), 2),
        catchError((err) => {
          console.log(err.message, 'batch');
          return of([]);
        }),
      );
  }

  bulkUpsert$(datas: Prisma.medicine_ingredientCreateInput[], batchSize = 10) {
    return from(datas).pipe(
      mergeMap((data) => {
        const { id, ...rest } = data;
        return this.prisma.medicine_ingredient.upsert({
          where: { id },
          update: rest,
          create: data,
        });
      }, batchSize),
      toArray(),
    );
  }

  convertDtoToPrismaSchema(
    dto: Medicine.Ingredient.Dto,
  ): Prisma.medicine_ingredientCreateInput {
    const { code, type, unit, state_code, state, ...rest } = dto;
    return {
      id: code,
      ...rest,
      code,
      type: type.toString() ?? '',
      unit: unit ?? '',
      state_code: state_code ?? '',
      state: state ?? '',
    };
  }
}
