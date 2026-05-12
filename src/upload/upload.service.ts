import { Injectable } from '@nestjs/common';
import cloudinary from 'src/common/config/cloudinary/cloudinary.config';

@Injectable()
export class UploadService {

  async uploadImage(
    file: Express.Multer.File, 
    folder: string,
    publicId?: string ): Promise<{ url: string; publicId: string }> {
        
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image', 
          public_id: publicId,
          overwrite: !!publicId,
        },
        (error, result) => {
          if (error || !result) return reject(error);

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      stream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}