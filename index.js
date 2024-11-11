const express = require("express");
const fileRoutes = require("./src/routes/fileRoutes");

const app = express();

app.use("/api", fileRoutes); // Prefixo para as rotas

app.get("/teste", (req, res) => {
  res.send("Servidor rodando");
});

app.listen(3000, () => console.log("Server Running on port 3000"));
