const express = require("express");
const multer = require("multer");
const minioClient = require("./config/minio");
const app = express();

// Configuração do Multer para receber o arquivo
const upload = multer({ dest: "uploads/" }); // Armazena os arquivos temporariamente na pasta 'uploads/'

// Inicia o servidor
app.listen(3000, () => console.log("Server Running"));

// Rota de teste
app.get("/teste", (req, res) => {
  res.send("Servidor rodando");
});

// Rota de upload
app.post("/upload", upload.single("file"), (req, res) => {
  const bucketName = "pasta1";
  const file = req.file; // Arquivo enviado
  const fileName = file.originalname;

  // Lê o arquivo temporário e o envia para o MinIO
  minioClient.fPutObject(bucketName, fileName, file.path, (err, etag) => {
    if (err) {
      console.error("Erro ao fazer upload:", err);
      return res.status(500).send("Erro ao fazer upload do arquivo.");
    }

    // Remove o arquivo temporário depois do upload
    require("fs").unlinkSync(file.path);

    res.send(`Arquivo '${fileName}' enviado com sucesso! Etag: ${etag}`);
  });
});

app.get("/buckets", async (req, res) => {
  try {
    const buckets = await minioClient.listBuckets();
    res.json(buckets);
  } catch (err) {
    console.lot("Erro ao listar buckets:", err);
    res.status(500).send("Erro ao listar buckets");
  }
});

app.get("/arquivos/:bucketName", (req, res) => {
  const bucketName = req.params.bucketName;
  const fileList = [];

  const stream = minioClient.listObjectsV2(bucketName, "", true);

  stream.on("data", (obj) => fileList.push(obj.name));
  stream.on("error", (err) => {
    console.error("Erro ao listar arquivos:", err);
    res.status(500).send("Erro ao listar arquivos.");
  });
  stream.on("end", () => {
    res.json(fileList);
  });
});
