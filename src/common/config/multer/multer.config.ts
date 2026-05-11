import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export const MulterConfig = MulterModule.register({
  storage: memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});