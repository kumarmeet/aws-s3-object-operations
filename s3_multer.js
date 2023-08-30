const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET,
    },
    sslEnabled: false,
    s3ForcePathStyle: true,
});

const upload = (uploadPath = "static/uploads/", allowedExtensions = ["jpg", "jpeg", "png", "pdf"]) => {
    // uploadPath = path.join(__dirname, "..") + uploadPath
    return multer({
        // storage: multer.diskStorage({
        //     destination: uploadPath,
        //     filename: (req, file, cb) => {
        //         cb(null, `${crypto.randomUUID()}-${file.originalname}`)
        //     },
        // }),
        storage: multerS3({
            s3: s3,
            bucket: process.env.S3_BUCKET,
            acl: "public-read",
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // filename: (req, file, cb) => {
            //     cb(null, `${crypto.randomUUID()}-${file.originalname}`)
            // },
            key: function (req, file, cb) {
                // Specify the desired file name and location in the bucket
                cb(null, `${uploadPath}${crypto.randomUUID()}${file.originalname}`);
            },
        }),

        limits: { fileSize: 25 * 1024 * 1024 },

        fileFilter: (req, file, cb) => {
            let ext = path.extname(file.originalname).toLocaleLowerCase();
            ext = ext.slice(1);

            // if (req.path === "/claim-settlements") {
            //   allowedExtensions.push("docx");
            // }

            if (allowedExtensions.includes(ext)) {
                cb(null, true);
            } else {
                const error = {
                    message: "Only images with a .jpg, .jpeg, or .png extension are allowed",
                    code: "FILE_EXT_NOT_ALLOWED",
                };

                return cb(error, false);
            }
        },
    });
};

const configMulter = upload;

module.exports = configMulter;
