import express from "express";
import { readInventario, writeInventario } from "./data/fileStore.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

app.get("/api/inventario", async (req, res, next) => {
  try {
    const inventario = await readInventario();
    res.status(200).json(inventario);
  } catch (error) {
    next(error);
  }
});

app.post("/api/inventario", async (req, res, next) => {
  try {
    const nuevoProducto = req.body;

    // Validación básica
    if (!nuevoProducto.nombre || !nuevoProducto.precio) {
      return res.status(400).json({ error: "El nombre y el precio son obligatorios" });
    }

    const inventario = await readInventario();
    
    nuevoProducto.id = Date.now().toString();
    inventario.push(nuevoProducto);

    await writeInventario(inventario);

    res.status(201).json({
      message: "Producto creado exitosamente",
      producto: nuevoProducto
    });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/inventario/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    const inventario = await readInventario();
    const index = inventario.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    inventario[index] = { ...inventario[index], ...datosActualizados };

    // Guardar en disco
    await writeInventario(inventario);

    res.status(200).json({
      message: "Producto actualizado exitosamente",
      producto: inventario[index]
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/inventario/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const inventario = await readInventario();
    const index = inventario.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Remover el elemento del arreglo
    const productoEliminado = inventario.splice(index, 1)[0];

    await writeInventario(inventario);

    res.status(200).json({
      message: "Producto eliminado exitosamente",
      producto: productoEliminado
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware centralizado de errores (500)
app.use((err, req, res, next) => {
  console.error("Error interno:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

export default app;