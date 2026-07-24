import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

import {
  ROOM_IMAGE_ALLOWED_TYPES,
  ROOM_IMAGE_MAX_SIZE,
} from '../constants/upload.constants';

import {
  ROOM_IMAGE_UPLOAD_PATH,
} from '../constants/upload-paths.constant';


// ==========================================
// ROOM IMAGE FILE FILTER
// ==========================================
export const roomImageFileFilter = (
  request: Express.Request,
  file: Express.Multer.File,
  callback: (
    error: Error | null,
    acceptFile: boolean,
  ) => void,
) => {

  if (
    !ROOM_IMAGE_ALLOWED_TYPES.test(
      file.originalname,
    )
  ) {
    return callback(
      new BadRequestException(
        'Only JPG, JPEG, PNG and WEBP images are allowed.',
      ),
      false,
    );
  }

  callback(
    null,
    true,
  );
};

// ==========================================
// MULTER STORAGE
// ==========================================
export const multerStorage = diskStorage({
  destination: ROOM_IMAGE_UPLOAD_PATH,

  filename: (
    request,
    file,
    callback,
  ) => {
    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${extname(file.originalname)}`;

    callback(
      null,
      uniqueName,
    );
  },
});

// ==========================================
// ROOM IMAGE MULTER OPTIONS
// ==========================================
export const roomImageMulterOptions = {
  storage: multerStorage,

  limits: {
    fileSize:
      ROOM_IMAGE_MAX_SIZE,
  },

  fileFilter:
    roomImageFileFilter,
};