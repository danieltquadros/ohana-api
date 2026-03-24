import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'ohana',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(new Error(error.message || 'Upload failed'));
          if (!result)
            return reject(new Error('Upload failed: no result returned'));
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<{ result: string }> {
    return cloudinary.uploader.destroy(publicId);
  }
}
