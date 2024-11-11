const fileService = require("../services/fileService");

const uploadFile = async (req, res) => {
  const bucketName = "pasta1";
  const file = req.file;
  const fileName = file.originalname;

  try {
    const etag = await fileService.uploadFile(bucketName, fileName, file.path);
    res.send(`Arquivo '${fileName}' enviado com sucesso! Etag: ${etag}`);
  } catch (err) {
    console.error("Erro ao fazer upload:", err);
    res.status(500).send("Erro ao fazer upload do arquivo.");
  }
};

const getBuckets = async (req, res) => {
  try {
    const buckets = await fileService.listBuckets();
    res.json(buckets);
  } catch (err) {
    console.error("Erro ao listar buckets:", err);
    res.status(500).send("Erro ao listar buckets.");
  }
};

const getFilesInBucket = async (req, res) => {
  const bucketName = req.params.bucketName;

  try {
    const fileList = await fileService.listFilesInBucket(bucketName);
    res.json(fileList);
  } catch (err) {
    console.error("Erro ao listar arquivos:", err);
    res.status(500).send("Erro ao listar arquivos.");
  }
};
/*
const getFile = async (req, res) => {
  const bucketName = req.params.bucketName;
  const fileName = req.params.fileName;
  if (!bucketName || !fileName) {
    return res
      .status(400)
      .json({ error: "Nome do bucket e do arquivo precisam ser informados" });
  }
  try {
    const arquivo = await fileService.getFile(bucketName, fileName);
    res.json(buckets);
  } catch (err) {
    console.error("Erro mostrar o arquivo", err);
    res.status(500).send("Erro ao mostrar o arquivo");
  }
};
*/
const deleteFile = async (req, res) => {
  const bucketName = req.params.bucketName;
  const fileName = req.params.fileName;
  console.log(req.params);
  if (!bucketName || !fileName) {
    return res
      .status(400)
      .json({ error: "Nome do bucket e do arquivo precisam ser informados" });
  }

  try {
    const result = await fileService.deleteFile(bucketName, fileName);
    res.status(200).json({ message: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar o arquivo" });
  }
};

module.exports = { uploadFile, getBuckets, getFilesInBucket, deleteFile };
