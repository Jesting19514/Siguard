const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb'); // Incluye ObjectId aquí
const app = express();
const port = 3000;

// Configura CORS
app.use(cors());
app.use(express.json()); // Asegúrate de incluir este middleware para manejar JSON

// Conexión a MongoDB
const uri = 'mongodb+srv://jestgx:xRvHh597z2ouTGbC@siguard.dcen2.mongodb.net/?retryWrites=true&w=majority&appName=Siguard';
const client = new MongoClient(uri);

// Mantener la conexión abierta
async function connectDB() {
    try {
        await client.connect();
        console.log("Conectado a MongoDB");
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

// Ruta para obtener las guarderías
app.get('/api/daycares', async (req, res) => {
    try {
        const database = client.db("siguard");
        const collection = database.collection("guarderias");
        const daycares = await collection.find({}).toArray();
        res.json(daycares);
    } catch (error) {
        console.error('Error al obtener las guarderías:', error);
        res.status(500).json({ error: 'Error al obtener las guarderías' });
    }
});


// Ruta para actualizar la razón social de una guardería
app.put('/api/daycares/:id', async (req, res) => {
  const { id } = req.params; // id es una cadena simple
  const { razon_social } = req.body;

  try {
      const database = client.db("siguard");
      const collection = database.collection("guarderias");

      // Busca usando el ID como cadena
      const result = await collection.updateOne(
          { _id: id }, // Usa el ID directamente como cadena
          { $set: { razon_social: razon_social } }
      );

      if (result.modifiedCount === 1) {
          res.json({ success: true, message: 'Guardería actualizada correctamente.' });
      } else {
          res.status(404).json({ success: false, message: 'Guardería no encontrada.' });
      }
  } catch (error) {
      console.error('Error al actualizar la guardería:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar la guardería.' });
  }
});


// Inicia el servidor y la conexión a la base de datos
app.listen(port, async () => {
    await connectDB(); // Conectar a la base de datos cuando se inicia el servidor
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
