import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { FileService } from './file.service';
import { ImageOptimizerService } from './image-optimizer.service';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly imageOptimizerService: ImageOptimizerService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: '파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    const uploadFolder = folder || 'general';
    const result = await this.fileService.uploadFile(file, uploadFolder);

    // Generate optimized image variants (stub)
    let variants = null;
    if (file.mimetype.startsWith('image/')) {
      variants = await this.imageOptimizerService.optimizeImage(
        file.buffer,
        result.filename,
      );
    }

    return {
      ...result,
      variants,
    };
  }
}
