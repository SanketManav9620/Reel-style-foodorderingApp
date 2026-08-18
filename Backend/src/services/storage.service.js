const ImageKit = require("@imagekit/nodejs");
const fs = require('fs');
const path = require('path');

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

let imagekit = null;
if (publicKey && privateKey && urlEndpoint && !publicKey.includes('dummy')) {
  try {
    imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
  } catch {
    // ignore initialization error
  }
}

/**
 * Uploads a file buffer (from multer) instantly to local storage with optional ImageKit sync
 * @param {Buffer} fileBuffer - The buffer of the uploaded file
 * @param {string} fileName - Original or generated file name
 * @returns {Promise<string>} The uploaded file's public URL
 */
const uploadToImageKit = async (fileBuffer, fileName) => {
  const cleanFileName = fileName
    ? `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    : `video_${Date.now()}.mp4`;

  try {
    // 1. Save video file to Frontend public/uploads for instant local serving
    const frontendPublicUploads = path.join(__dirname, '../../../Frontend/public/uploads');
    if (!fs.existsSync(frontendPublicUploads)) {
      fs.mkdirSync(frontendPublicUploads, { recursive: true });
    }
    const localFilePath = path.join(frontendPublicUploads, cleanFileName);
    fs.writeFileSync(localFilePath, fileBuffer);
    console.log("✅ Saved video file locally to:", localFilePath);

    // 2. Background ImageKit sync if configured
    if (imagekit) {
      imagekit.files.upload({
        file: fileBuffer,
        fileName: cleanFileName,
        folder: '/food-reels'
      }).then(res => console.log("✅ ImageKit upload successful:", res.url))
        .catch(err => console.warn("⚠️ ImageKit sync warning:", err.message));
    }

    return `/uploads/${cleanFileName}`;
  } catch (fsErr) {
    console.error("Local file save error:", fsErr);
    return '/videos/video1.mp4';
  }
};

module.exports = { imagekit, uploadToImageKit };