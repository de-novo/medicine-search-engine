import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { UtilProvider } from '@src/batch/util.provider';
import { S3Service } from '@src/common/aws/s3/s3.service';
import { DurBatch } from '@src/type/batch/dur';
import { MedicineBatch } from '@src/type/batch/medicine';
import { mockDeep } from 'jest-mock-extended';
import typia from 'typia';

describe('util.provider.ts', () => {
  // let httpService: HttpService;
  let util: UtilProvider;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpService, UtilProvider, S3Service],
    })
      .overrideProvider(HttpService)
      .useValue(mockDeep<HttpService>())
      .compile();

    // httpService = module.get<HttpService>(HttpService);
    util = module.get<UtilProvider>(UtilProvider);
  });

  describe('formatDate', () => {
    it('null을 입력시 null을 반환한다.', () => {
      // arrange
      const dateString = null;
      const expected = null;

      // act
      const result = util.formatDate(dateString);

      // assert
      expect(result).toEqual(expected);
    });

    it('빈 문자열을 입력시 null을 반환한다.', () => {
      // arrange
      const dateString = '';
      const expected = null;

      // act
      const result = util.formatDate(dateString);

      // assert
      expect(result).toEqual(expected);
    });

    it('yyyy-mm-dd를 입력시 Date 객체를 반환한다', () => {
      // arrange
      const dateString = '2021-01-01';
      const expected = new Date('2021-01-01');

      // act
      const result = util.formatDate(dateString);

      // assert
      expect(result).toEqual(expected);
    });

    it('yyyy-mm-dd hh:mm:ss를 입력시 Date 객체를 반환한다', () => {
      // arrange
      const dateString = '2021-01-01 00:00:00';
      const expected = new Date('2021-01-01 00:00:00');

      // act
      const result = util.formatDate(dateString);

      // assert
      expect(result).toEqual(expected);
    });

    it('yyyymmdd를 입력시 Date 객체를 반환한다', () => {
      // arrange
      const dateString = '20210101';
      const expected = new Date('2021-01-01');

      // act
      const result = util.formatDate(dateString);

      // assert
      expect(result).toEqual(expected);
    });
  });

  describe('splitStringToArray', () => {
    describe('separator가 , 혹은 입력을 안했을때', () => {
      it('xxxxx형식의 문자열 입력시 배열을 반환한다', () => {
        // arrange
        const standardCode = '12345';
        const expected = ['12345'];

        // act
        const result = util.splitStringToArray(standardCode);

        // assert
        expect(result).toEqual(expected);
      });

      it('xxxxx,xxxxx형식의 문자열 입력시 배열을 반환한다', () => {
        // arrange
        const standardCode = '12345,67890';
        const expected = ['12345', '67890'];

        // act
        const result = util.splitStringToArray(standardCode);

        // assert
        expect(result).toEqual(expected);
      });

      it('null을 입력시 빈 배열을 반환한다', () => {
        // arrange
        const standardCode = null;
        const expected: [] = [];

        // act
        const result = util.splitStringToArray(standardCode);

        // assert
        expect(result).toEqual(expected);
      });

      it('빈 문자열을 입력시 빈 배열을 반환한다', () => {
        // arrange
        const standardCode = '';
        const expected: [] = [];

        // act
        const result = util.splitStringToArray(standardCode);

        // assert
        expect(result).toEqual(expected);
      });

      it('코드를 입력하지 않으면 빈 배열을 반환한다', () => {
        // arrange
        const standardCode = undefined;
        const expected: [] = [];

        // act
        const result = util.splitStringToArray(standardCode);

        // assert
        expect(result).toEqual(expected);
      });
    });

    describe('separator를 입력했을때', () => {
      const separator = '/';
      it('xxxxx형식의 문자열 입력시 배열을 반환한다', () => {
        // arrange
        const standardCode = '12345';
        const expected = ['12345'];

        // act
        const result = util.splitStringToArray(standardCode, separator);

        // assert
        expect(result).toEqual(expected);
      });

      it('xxxxx/xxxxx형식의 문자열 입력시 배열을 반환한다', () => {
        // arrange
        const standardCode = '12345/67890';
        const expected = ['12345', '67890'];

        // act
        const result = util.splitStringToArray(standardCode, separator);

        // assert
        expect(result).toEqual(expected);
      });

      it('null을 입력시 빈 배열을 반환한다', () => {
        // arrange
        const standardCode = null;
        const expected: [] = [];

        // act
        const result = util.splitStringToArray(standardCode, separator);

        // assert
        expect(result).toEqual(expected);
      });

      it('빈 문자열을 입력시 빈 배열을 반환한다', () => {
        // arrange
        const standardCode = '';
        const expected: [] = [];

        // act
        const result = util.splitStringToArray(standardCode, separator);

        // assert
        expect(result).toEqual(expected);
      });

      it('코드를 입력하지 않으면 빈 배열을 반환한다', () => {
        // arrange
        const standardCode = undefined;
        const expected: [] = [];

        // act
        const result = util.splitStringToArray(standardCode, separator);

        // assert
        expect(result).toEqual(expected);
      });
    });
  });

  describe('parseCodeNamePairs: default separator: /', () => {
    // arrange
    describe('separator가 / 혹은 입력을 안했을때', () => {
      const strs = '[M040702]포도당/[M040426]염화나트륨';
      const str = '[M040702]포도당';

      it('[code]name 형식의 문자열을 입력시 해당 객체 배열을 반환한다.(복합)', () => {
        // arrange
        const expected = [
          {
            code: 'M040702',
            name: '포도당',
          },
          {
            code: 'M040426',
            name: '염화나트륨',
          },
        ];

        // act
        const result = util.parseCodeNamePairs(strs);

        // assert
        expect(result).toEqual(expected);
      });

      it('[code]name 형식의 문자열을 입력시 해당 객체 배열을 반환한다.(단일)', () => {
        // arrange
        const expected = [
          {
            code: 'M040702',
            name: '포도당',
          },
        ];

        // act
        const result = util.parseCodeNamePairs(str);

        // assert
        expect(result).toEqual(expected);
      });

      it('문자열을 입력하지 않으면 빈 배열을 반환한다.', () => {
        // arrange
        const strs = '';
        const expected: [] = [];

        // act
        const result = util.parseCodeNamePairs(strs);

        // assert
        expect(result).toEqual(expected);
      });

      it('성분 문자열의 형식이 [xxxx]ooo가 아니면 해당 객체는 제외한다.(복합)', () => {
        // arrange
        const strs = '<code>name/[M040702]포도당';
        const expected = [
          {
            code: 'M040702',
            name: '포도당',
          },
        ];

        // act
        const result = util.parseCodeNamePairs(strs);

        // assert
        expect(result).toEqual(expected);
      });

      it(' 문자열의 형식이 [xxxx]ooo가 아니면 해당 객체는 제외한다.(단일)', () => {
        // arrange
        const strs = '<code>name';
        const expected: [] = [];

        // act
        const result = util.parseCodeNamePairs(strs);

        // assert
        expect(result).toEqual(expected);
      });
    });
    describe('separator를 입력했을때', () => {
      const separator = '|';
      const strs = '[M040702]포도당|[M040426]염화나트륨';
      const str = '[M040702]포도당';

      it('[code]name 형식의 문자열을 입력시 해당 객체 배열을 반환한다.(복합)', () => {
        // arrange
        const expected = [
          {
            code: 'M040702',
            name: '포도당',
          },
          {
            code: 'M040426',
            name: '염화나트륨',
          },
        ];

        // act
        const result = util.parseCodeNamePairs(strs, separator);

        // assert
        expect(result).toEqual(expected);
      });

      it('[code]name 형식의 문자열을 입력시 해당 객체 배열을 반환한다.(단일)', () => {
        // arrange
        const expected = [
          {
            code: 'M040702',
            name: '포도당',
          },
        ];

        // act
        const result = util.parseCodeNamePairs(str, separator);

        // assert
        expect(result).toEqual(expected);
      });

      it('문자열을 입력하지 않으면 빈 배열을 반환한다.', () => {
        // arrange
        const strs = '';
        const expected: [] = [];

        // act
        const result = util.parseCodeNamePairs(strs);

        // assert
        expect(result).toEqual(expected);
      });

      it('성분 문자열의 형식이 [xxxx]ooo가 아니면 해당 객체는 제외한다.(복합)', () => {
        // arrange
        const strs = '<code>name|[M040702]포도당';
        const expected = [
          {
            code: 'M040702',
            name: '포도당',
          },
        ];

        // act
        const result = util.parseCodeNamePairs(strs, separator);

        // assert
        expect(result).toEqual(expected);
      });

      it(' 문자열의 형식이 [xxxx]ooo가 아니면 해당 객체는 제외한다.(단일)', () => {
        // arrange
        const strs = '<code>name';
        const expected: {
          code: string;
          name: string;
        }[] = [];

        // act
        const result = util.parseCodeNamePairs(strs, separator);

        // assert
        expect(result).toEqual(expected);
      });
    });
  });

  describe('convertOpenApiToDto', () => {
    function convertOpenApiToDtoTestHelper<T, U>(
      fn: (openApiDTO: T, keyMap: Record<keyof T, keyof U>) => U,
      openApiDTO: T,
      keyMap: any,
    ) {
      const expectedList = Object.values(keyMap);

      // act
      const result = fn(openApiDTO as T, keyMap);
      const resultKeys = Object.keys(result as any);
      // assert
      expect(resultKeys.every((key) => expectedList.includes(key as any))).toBe(
        true,
      );
    }

    function convertOpenApiToDtoTestCaseBuilder(
      test: string,
      openApiDTO: any,
      keyMap: any,
    ) {
      return { test, openApiDTO, keyMap };
    }

    const testCase = [
      /**
       * Medicine
       * - Detail
       * - Common
       */
      convertOpenApiToDtoTestCaseBuilder(
        'Medicine Detail OpenApi를 Detail Dto로 변환한다',
        typia.random<MedicineBatch.Detail.OpenApiDto>(),
        MedicineBatch.Detail.OPEN_API_DTO_KEY_MAP,
      ),
      convertOpenApiToDtoTestCaseBuilder(
        'Medicine Common OpenApi를 Common Dto로 변환한다',
        typia.random<MedicineBatch.Common.OpenApiDto>(),
        MedicineBatch.Common.OPEN_API_DTO_KEY_MAP,
      ),

      /**
       * Dur
       * - Ingredient
       * - - Age
       * - - Combined
       * - - DuplicateEffect
       * - - Old
       * - - Period
       * - - Pregnant
       * - - Volume
       */
      convertOpenApiToDtoTestCaseBuilder(
        'DUR Ingredient Age OpenApi를 DUR Ingredient Age Dto로 변환한다',
        typia.random<DurBatch.Ingredient.Age.OpenApiDto>(),
        DurBatch.Ingredient.Age.OPEN_API_DTO_KEY_MAP,
      ),
      convertOpenApiToDtoTestCaseBuilder(
        'DUR Ingredient Combined OpenApi를 DUR Ingredient Combined Dto로 변환한다',
        typia.random<DurBatch.Ingredient.Combined.OpenApiDto>(),
        DurBatch.Ingredient.Combined.OPEN_API_DTO_KEY_MAP,
      ),
      convertOpenApiToDtoTestCaseBuilder(
        'DUR Ingredient OpenApi를 DUR Ingredient Dto로 변환한다',
        typia.random<DurBatch.Ingredient.DuplicateEffect.OpenApiDto>(),
        DurBatch.Ingredient.DuplicateEffect.OPEN_API_DTO_KEY_MAP,
      ),

      convertOpenApiToDtoTestCaseBuilder(
        'DUR Ingredient Old OpenApi를 DUR Ingredient Old Dto로 변환한다',
        typia.random<DurBatch.Ingredient.Old.OpenApiDto>(),
        DurBatch.Ingredient.Old.OPEN_API_DTO_KEY_MAP,
      ),
      convertOpenApiToDtoTestCaseBuilder(
        'DUR Ingredient Period OpenApi를 DUR Ingredient Period Dto로 변환한다',
        typia.random<DurBatch.Ingredient.Period.OpenApiDto>(),
        DurBatch.Ingredient.Period.OPEN_API_DTO_KEY_MAP,
      ),
      convertOpenApiToDtoTestCaseBuilder(
        'DUR Ingredient Pregnant OpenApi를 DUR Ingredient Pregnant Dto로 변환한다',
        typia.random<DurBatch.Ingredient.Pregnant.OpenApiDto>(),
        DurBatch.Ingredient.Pregnant.OPEN_API_DTO_KEY_MAP,
      ),
      convertOpenApiToDtoTestCaseBuilder(
        'DUR Ingredient Volumet OpenApi를 DUR Ingredient Volumet Dto로 변환한다',
        typia.random<DurBatch.Ingredient.Volume.OpenApiDto>(),
        DurBatch.Ingredient.Volume.OPEN_API_DTO_KEY_MAP,
      ),
    ];

    it.each(testCase)('$test', ({ openApiDTO, keyMap }) => {
      convertOpenApiToDtoTestHelper(
        util.convertOpenApiToDto,
        openApiDTO,
        keyMap,
      );
    });
  });
});
