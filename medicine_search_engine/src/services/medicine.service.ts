import { Injectable } from '@nestjs/common';
import { Prisma, medicine } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { SelectAll } from '@src/utils/excludeField';
import typia from 'typia';
/**
 * MEDICINE
 *
 * 1. 의약품 특성상 조회만 가능하도록 구현
 */
@Injectable()
export class MedicineService {
  constructor(private readonly prisma: PrismaService) {}

  transeformPage(
    input: Prisma.medicineGetPayload<ReturnType<typeof this.selectPage>>,
  ) {
    return {
      id: input.id,
      name: input.name,
      company_name: input.company,
    };
  }

  selectPage() {
    return {
      select: {
        ...typia.random<SelectAll<medicine>>(),
        document: false,
        usage: false,
        effect: false,
        change_content: false,
        caution: false,
      },
    } satisfies Prisma.medicineFindManyArgs;
  }

  // -------------------------
  // READ
  // -------------------------
  /**
   * 성능 기록
   * - 환경
   *  - 16GB RAM
   *  - mac M1 Pro
   * ### no index [name]
   * - 검색어 X
   *  - 100ms ~ 400ms
   *
   * - 검색어 O
   *   - 검색어 : '졸정'
   *   - 600ms ~ 800ms
   * 
   * ### index [name]
   * - 검색어 X
   * 
   */
  async getMedicineList({
    page,
    limit,
    search = '',
  }: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const medicineList = await this.prisma.medicine.findMany({
      ...this.selectPage(),
      skip: (page - 1) * limit,
      take: limit,
      ...(search && {
        where: {
          name: {
            contains: search,
          },
        },
      }),
    });
    const totalCount = await this.prisma.medicine.count({
      ...(search && {
        where: {
          name: {
            contains: search,
          },
        },
      }),
    });

    return {
      medicineList,
      totalCount,
    };
  }

  async getMedicineInsuranceList(insuranceCedes: string[]) {
    const medicineList = await this.prisma.medicine_insurance.findMany({
      where: {
        insurance_code: {
          in: insuranceCedes,
        },
      },
    });
    return medicineList;
  }
}