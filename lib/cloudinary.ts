import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  file: string,
  folder = "jewelry-store/products"
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    transformation: [
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(url: string, width?: number): string {
  if (!url.includes("cloudinary.com")) return url;
  const transforms = ["q_auto", "f_auto"];
  if (width) transforms.push(`w_${width}`);
  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
}

export default cloudinary;
