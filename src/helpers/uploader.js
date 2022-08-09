const cloudinary = require("../modules/cloudinary");
const streamfier = require("streamifier");

async function upload(file, objectId) {
  return new Promise((resolve, rej) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource: "image",
        public_id: objectId,
        eager: {
          width: 150,
          height: 150,
        },
        eager_async: true,
        format: "webp",
      },
      (err, res) => {
        if (err) {
          console.log(err.message);
          rej(err);
        }
        resolve(res);
      }
    );

    streamfier.createReadStream(file.buffer).pipe(uploadStream);
  });
}

async function del(publicId) {
  const respond = await cloudinary.uploader.destroy(publicId);
  return respond;
}

async function publicId(url) {
  url.split("/").pop();
}

module.exports = {
  upload,
  delete: del,
};
