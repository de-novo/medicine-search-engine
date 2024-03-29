import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DurAgeTabooBatchService } from '../DUR/durAgeTabooBatch.service';
import { DurCombinedTabooBatchService } from '../DUR/durCombinedTabooBatch.service';
import { DurDuplicateEffectTabooBatchService } from '../DUR/durDuplicateEffectTabooBatch.service';
import { DurOldTabooBatchService } from '../DUR/durOldTabooBatch.service';
import { DurPeriodTabooBatchService } from '../DUR/durPeriodTabooBatch.service';
import { DurPregnantTabooBatchService } from '../DUR/durPregnantTabooBatch.service';
import { DurVolumeTabooBatchService } from '../DUR/durVolumeTabooBatch.service';
import { DiseaseBatchService } from '../disease/diseaseBatch.service';
import { InsuranceBatchService } from '../insurance/insuranceBatch.Service';
import { UtilProvider } from '../util.provider';
import { MedicineBatchController } from './medicineBatch.controller';
import { MedicineCommonBatchService } from './services/medicineCommonBatch.service';
import { MedicineDetailBatchService } from './services/medicineDetailBatch.service';
import { MedicineIdentificationBatchService } from './services/medicineIdentificationBatch.service';
import { MedicineIngredientBatchService } from './services/medicineIngredient.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [MedicineBatchController],
  providers: [
    MedicineDetailBatchService,
    MedicineCommonBatchService,
    DurCombinedTabooBatchService,
    DurAgeTabooBatchService,
    DurPregnantTabooBatchService,
    DurVolumeTabooBatchService,
    DurPeriodTabooBatchService,
    DurOldTabooBatchService,
    DurDuplicateEffectTabooBatchService,
    InsuranceBatchService,
    MedicineIdentificationBatchService,
    MedicineIngredientBatchService,
    DiseaseBatchService,
    UtilProvider,
  ],
})
export class MedicineBatchModule {}
