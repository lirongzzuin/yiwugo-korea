import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ImageOptimizerService } from './image-optimizer.service';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  ],
  controllers: [FileController],
  providers: [FileService, ImageOptimizerService],
  exports: [FileService, ImageOptimizerService],
})
export class FileModule {}
