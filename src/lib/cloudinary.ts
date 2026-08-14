import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'hswppapu';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

const configured = !!(CLOUD_NAME && API_KEY && API_SECRET);

if (configured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

export function isCloudinaryConfigured(): boolean {
  return configured;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = 'vehicles',
  publicId?: string,
): Promise<{ url: string; publicId: string }> {
  if (!configured) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `teslaprime/${folder}`,
        public_id: publicId,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        max_bytes: 5 * 1024 * 1024,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      },
    );
    uploadStream.end(fileBuffer);
  });
}

export function getCloudinaryPublicUrl(publicId: string, options?: { width?: number; height?: number; crop?: string }): string {
  const opts: any = { secure: true, fetch_format: 'auto', quality: 'auto' };
  if (options?.width || options?.height) {
    opts.transformation = [{ width: options.width, height: options.height, crop: options.crop || 'fill' }];
  }
  return cloudinary.url(publicId, opts);
}
