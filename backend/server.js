import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, "data");

function readJSON(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

app.get("/categories", (req, res) => {
    try {
        const file = path.join(dataPath, "cats/cat.json");
        res.json(readJSON(file));
    } catch (error) {
        res.status(500).json({ error: "Error al leer categorías" });
    }
});

app.get("/products/:catID", (req, res) => {
    try {
        const file = path.join(dataPath, `cats_products/${req.params.catID}.json`);
        res.json(readJSON(file));
    } catch (error) {
        res.status(500).json({ error: "Error al leer productos de categoría" });
    }
});

app.get("/product/:id", (req, res) => {
    try {
        const file = path.join(dataPath, `products/${req.params.id}.json`);
        res.json(readJSON(file));
    } catch (error) {
        res.status(500).json({ error: "Error al leer info del producto" });
    }
});

app.get("/product/:id/comments", (req, res) => {
    try {
        const file = path.join(dataPath, `products_comments/${req.params.id}.json`);
        res.json(readJSON(file));
    } catch (error) {
        res.status(500).json({ error: "Error al leer comentarios" });
    }
});

app.get("/user_cart/25801", (req, res) => {
    try {
        const file = path.join(dataPath, "user_cart/25801.json");
        res.json(readJSON(file));
    } catch (error) {
        res.status(500).json({ error: "Error al leer carrito del usuario" });
    }
});

app.listen(3000, () => {
    console.log("Servidor backend corriendo en http://localhost:3000");
});
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/login', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
