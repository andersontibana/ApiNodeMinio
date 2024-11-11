const minioClient = require("../config/minio");
const fs = require("fs");

const uploadFile = (bucketName, fileName, filePath) => {
  return new Promise((resolve, reject) => {
    minioClient.fPutObject(bucketName, fileName, filePath, (err, etag) => {
      if (err) {
        reject(err);
      } else {
        fs.unlinkSync(filePath); // Remove o arquivo temporário
        resolve(etag);
      }
    });
  });
};

const listBuckets = async () => {
  return await minioClient.listBuckets();
};

const listFilesInBucket = (bucketName) => {
  return new Promise((resolve, reject) => {
    const fileListPromises = [];
    const stream = minioClient.listObjectsV2(bucketName, "", true);

    stream.on("data", (obj) => {
      // Adiciona uma nova promessa para cada arquivo, incluindo o link de download
      const filePromise = minioClient
        .presignedUrl("GET", bucketName, obj.name, 24 * 60 * 60)
        .then((downloadUrl) => ({
          name: obj.name,
          size: obj.size, // Tamanho do arquivo em bytes
          url: downloadUrl, // Link para download
        }))
        .catch((error) => {
          console.error(
            `Erro ao gerar link para o arquivo ${obj.name}:`,
            error
          );
          return null; // Retorna null se ocorrer um erro
        });

      fileListPromises.push(filePromise);
    });

    stream.on("error", (err) => {
      reject(err);
    });

    stream.on("end", async () => {
      // Espera todas as promessas serem resolvidas antes de resolver o Promise principal
      const fileList = await Promise.all(fileListPromises);
      resolve(fileList.filter((file) => file !== null)); // Filtra nulls se houver erros
    });
  });
};

const deleteFile = (bucketName, fileName) => {
  return new Promise((resolve, reject) => {
    // Verifica se o arquivo existe antes de deletar
    minioClient.statObject(bucketName, fileName, (err, stat) => {
      if (err) {
        if (err.code === "NoSuchKey") {
          // Erro específico de arquivo inexistente
          reject(
            `O arquivo '${fileName}' não foi encontrado no bucket '${bucketName}'.`
          );
        } else {
          reject(`Erro ao verificar a existência do arquivo: ${err.message}`);
        }
        return;
      }

      // Se o arquivo existir, procede com a exclusão
      minioClient.removeObject(bucketName, fileName, (err) => {
        if (err) {
          reject(`Erro ao deletar o arquivo '${fileName}': ${err.message}`);
        } else {
          resolve(
            `Arquivo '${fileName}' deletado com sucesso do bucket '${bucketName}'.`
          );
        }
      });
    });
  });
};
/*
const getFile = (bucketName, fileName) => {
  return new Promise((resolve, reject) => {
    minioClient.statObject(bucketName, fileName, (err, stat) => {
      if (err) {
        if (err.code === "NoSuchKey") {
          // Erro específico de arquivo inexistente
          reject(
            `O arquivo '${fileName}' não foi encontrado no bucket '${bucketName}'.`
          );
        } else {
          reject(`Erro ao verificar a existência do arquivo: ${err.message}`);
        }
        return;
      }

      const fileStream = fs.createWriteStream(
        path.join(downloadPath, fileName)
      );

      minioClient.getObject(bucketName, fileName, (err, dataStream) => {
        if (err) {
          reject(`Erro ao obter o arquivo '${fileName}': ${err.message}`);
          return;
        }

        // Pipe do stream de dados para o stream de arquivo local
        dataStream.pipe(fileStream);

        dataStream.on("end", () => {
          resolve(
            `Arquivo '${fileName}' baixado com sucesso em '${downloadPath}'.`
          );
        });

        dataStream.on("error", (err) => {
          reject(`Erro no download do arquivo '${fileName}': ${err.message}`);
        });
      });
    });
  });
};*/

module.exports = {
  uploadFile,
  listBuckets,
  listFilesInBucket,
  deleteFile,
  //getFile,
};
