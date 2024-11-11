const { Client } = require("minio");

const minioClient = new Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "GV96dBwERSZwpyDq2Biw",
  secretKey: "HQamHWdSkjVyojnMa9oBdK2INGAzHMI5leLIoaZ9",
});

module.exports = minioClient;
