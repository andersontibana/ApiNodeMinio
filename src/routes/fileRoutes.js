const express = require("express");
const multer = require("multer");
const fileController = require("../controllers/fileController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/minio/buckets", fileController.getBuckets);
router.get("/minio/arquivos/:bucketName", fileController.getFilesInBucket);
router.post("/minio", upload.single("file"), fileController.uploadFile);
router.delete("/minio/:bucketName/:fileName", fileController.deleteFile);
//router.get("/minio/:bucketName/:fileName", fileController.getFile);

module.exports = router;
