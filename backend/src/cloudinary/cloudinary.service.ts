import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import {
  CLOUDINARY_ROOM_FOLDER,
} from '../common/constants/upload-paths.constant';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name:
        this.configService.get<string>(
          'CLOUDINARY_CLOUD_NAME',
        ),

      api_key:
        this.configService.get<string>(
          'CLOUDINARY_API_KEY',
        ),

      api_secret:
        this.configService.get<string>(
          'CLOUDINARY_API_SECRET',
        ),
    });
  }

  // ==========================================
// UPLOAD IMAGE
// ==========================================
async uploadImage(
  filePath: string,
) {
  const result =
    await cloudinary.uploader.upload(
      filePath,
      {
        folder: CLOUDINARY_ROOM_FOLDER,
      },
    );

  return result;
}

// ==========================================
// UPLOAD IMAGES
// ==========================================
async uploadImages(
  filePaths: string[],
) {
  return Promise.all(
    filePaths.map((filePath) =>
      this.uploadImage(filePath),
    ),
  );
}

// ==========================================
// DELETE IMAGE
// ==========================================
async deleteImage(
  publicId: string,
) {

  return cloudinary.uploader.destroy(
  publicId,
);
}
}