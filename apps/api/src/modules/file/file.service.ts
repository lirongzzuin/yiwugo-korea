import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly uploadRoot: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadRoot = this.configService.get<string>(
      'UPLOAD_ROOT',
      path.join(process.cwd(), 'uploads'),
    );
    this.baseUrl = this.configService.get<string>(
      'UPLOAD_BASE_URL',
      '/uploads',
    );
  }

  /**
   * Upload a file to local storage.
   * In production, this would upload to S3/R2/GCS.
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; filename: string; size: number }> {
    this.validateFile(file);

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const folderPath = path.join(this.uploadRoot, folder);
    const filePath = path.join(folderPath, filename);

    // Ensure directory exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, file.buffer);

    const url = `${this.baseUrl}/${folder}/${filename}`;

    this.logger.log(`File uploaded: ${url} (${file.size} bytes)`);

    return {
      url,
      filename,
      size: file.size,
    };
  }

  /**
   * Validate file mimetype and size.
   */
  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('파일이 제공되지 않았습니다.');
    }

    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `지원하지 않는 파일 형식입니다. 허용: ${ALLOWED_MIMETYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 허용됩니다.`,
      );
    }
  }

  /**
   * Generate a presigned URL stub for direct upload.
   * In production, this would generate a real presigned URL for S3/R2.
   */
  getUploadUrl(
    folder: string,
    filename: string,
  ): { uploadUrl: string; fileUrl: string } {
    const ext = path.extname(filename);
    const uniqueFilename = `${uuidv4()}${ext}`;

    return {
      uploadUrl: `${this.baseUrl}/${folder}/${uniqueFilename}?presigned=stub`,
      fileUrl: `${this.baseUrl}/${folder}/${uniqueFilename}`,
    };
  }
}
