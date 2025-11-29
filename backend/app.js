const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ruta genérica para devolver JSONs del directorio /data
app.get("/api/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(__dirname, "data", `${fileName}.json`);

  try {
    const data = require(filePath);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: "Archivo no encontrado" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`); 
});