const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.OBJECT_STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.OBJECT_STORAGE_SECRET_KEY,
  },
});

const sanitizeFileName = (name) => {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
};

const uploadBufferToR2 = async (file, folder = "signs") => {
  if (!file) return null;

  const originalName = sanitizeFileName(file.originalname);
  const ext = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf("."))
    : "";

  const key = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.OBJECT_STORAGE_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const baseUrl = process.env.OBJECT_STORAGE_PUBLIC_URL.replace(/\/$/, "");
  const url = `${baseUrl}/${key}`;

  return {
    key,
    url,
  };
};

module.exports = { uploadBufferToR2 };