const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

const DEFAULT_PORT = Number(process.env.BACKEND_PORT || 3000);
const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'siguard';
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123*';
const ENCRYPTION_SECRET = process.env.DATA_ENCRYPTION_KEY || 'dev-only-secret-change-me';

function buildMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI no está configurada. Define la variable de entorno antes de iniciar la app.');
  }

  return new MongoClient(uri);
}

function toObjectId(id) {
  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  }
  return id;
}

function deriveKey() {
  return crypto.scryptSync(ENCRYPTION_SECRET, 'siguard-data-salt', 32);
}

function encryptText(plainText) {
  if (plainText === undefined || plainText === null) {
    return '';
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptText(payload) {
  if (!payload) {
    return '';
  }

  const parts = String(payload).split(':');
  if (parts.length !== 3) {
    return payload;
  }

  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash) {
    return false;
  }

  const [salt, storedHash] = String(passwordHash).split(':');
  if (!salt || !storedHash) {
    return false;
  }

  const candidateHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(candidateHash, 'hex'));
}

function normalizeDaycareForResponse(daycare) {
  return {
    ...daycare,
    razon_social: decryptText(daycare.razon_social),
    num_guarderia: decryptText(daycare.num_guarderia),
  };
}

async function ensureInitialData(database) {
  const users = database.collection('usuarios');
  const daycares = database.collection('guarderias');

  await users.createIndex({ nombre: 1 }, { unique: true });

  const existingAdmin = await users.findOne({ nombre: DEFAULT_ADMIN_USERNAME });
  let adminId;

  if (!existingAdmin) {
    const result = await users.insertOne({
      nombre: DEFAULT_ADMIN_USERNAME,
      password_hash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      id_roles: 1,
      created_at: new Date(),
      bootstrap: true,
    });
    adminId = result.insertedId;
    console.log(`Usuario admin creado: ${DEFAULT_ADMIN_USERNAME}`);
  } else {
    adminId = existingAdmin._id;
  }

  const existingSeedDaycare = await daycares.findOne({ bootstrap: true });
  if (!existingSeedDaycare) {
    await daycares.insertOne({
      razon_social: encryptText('Guardería de Prueba'),
      id_usuario_gerente: adminId,
      fecha_inicio: new Date(),
      fecha_termino: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      num_guarderia: encryptText('GD-001'),
      bootstrap: true,
      created_at: new Date(),
    });
    console.log('Guardería de prueba creada.');
  }
}

async function createServer() {
  const app = express();
  app.use(express.json());

  const client = buildMongoClient();
  await client.connect();
  const database = client.db(DEFAULT_DB_NAME);

  await ensureInitialData(database);

  app.get('/health', (req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/daycares', async (req, res) => {
    try {
      const collection = database.collection('guarderias');
      const daycares = await collection.find({}).toArray();
      res.json(daycares.map(normalizeDaycareForResponse));
    } catch (error) {
      console.error('Error al obtener las guarderías:', error);
      res.status(500).json({ error: 'Error al obtener las guarderías' });
    }
  });

  app.get('/api/daycares/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const collection = database.collection('guarderias');
      const daycare = await collection.findOne({ _id: toObjectId(id) });
      if (!daycare) {
        res.status(404).json({ success: false, message: 'Guardería no encontrada.' });
        return;
      }
      res.json({ success: true, daycare: normalizeDaycareForResponse(daycare) });
    } catch (error) {
      console.error('Error al obtener la guardería:', error);
      res.status(500).json({ success: false, message: 'Error al obtener la guardería.' });
    }
  });

  app.post('/api/daycares', async (req, res) => {
    const { _id, razon_social, id_usuario_gerente, fecha_inicio, fecha_termino, num_guarderia } = req.body;
    try {
      const usersCollection = database.collection('usuarios');
      const daycareCollection = database.collection('guarderias');
      const userName = String(razon_social || '').trim();
      const userPassword = String(num_guarderia || '').trim();

      if (!userName || !userPassword) {
        res.status(400).json({ success: false, message: 'Nombre de guardería y número de guardería son obligatorios.' });
        return;
      }

      const userExists = await usersCollection.findOne({ nombre: userName });
      if (userExists) {
        res.status(409).json({ success: false, message: 'Ya existe un usuario con ese nombre de guardería.' });
        return;
      }

      const managerUser = {
        nombre: userName,
        password_hash: hashPassword(userPassword),
        id_roles: 2,
        created_at: new Date(),
      };

      const userResult = await usersCollection.insertOne(managerUser);
      const managerId = userResult.insertedId;

      const daycarePayload = {
        _id: _id || new ObjectId(),
        razon_social: encryptText(razon_social),
        id_usuario_gerente: id_usuario_gerente || managerId,
        fecha_inicio: new Date(fecha_inicio),
        fecha_termino: new Date(fecha_termino),
        num_guarderia: encryptText(num_guarderia),
      };

      const daycareResult = await daycareCollection.insertOne(daycarePayload);

      res.json({
        success: true,
        message: 'Guardería agregada correctamente y usuario creado.',
        id: daycareResult.insertedId,
        user: { nombre: userName, id_roles: 2 },
      });
    } catch (error) {
      console.error('Error al agregar la guardería:', error);
      res.status(500).json({ success: false, message: 'Error al agregar la guardería.' });
    }
  });

  app.put('/api/daycares/:id', async (req, res) => {
    const { id } = req.params;
    const { razon_social, fecha_inicio, fecha_termino, num_guarderia } = req.body;
    try {
      const collection = database.collection('guarderias');
      const result = await collection.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            razon_social: encryptText(razon_social),
            fecha_inicio: new Date(fecha_inicio),
            fecha_termino: new Date(fecha_termino),
            num_guarderia: encryptText(num_guarderia),
          },
        },
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

  app.delete('/api/daycares/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const collection = database.collection('guarderias');
      const result = await collection.deleteOne({ _id: toObjectId(id) });

      if (result.deletedCount === 1) {
        res.json({ success: true, message: 'Guardería eliminada correctamente.' });
      } else {
        res.status(404).json({ success: false, message: 'Guardería no encontrada.' });
      }
    } catch (error) {
      console.error('Error al eliminar la guardería:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar la guardería.' });
    }
  });

  app.get(['/api/documents', '/api/documentos'], async (req, res) => {
    try {
      const { daycareNumber } = req.query;
      const filter = daycareNumber ? { num_guarderia: daycareNumber } : {};
      const collection = database.collection('documentos');
      const documents = await collection.find(filter).toArray();
      res.json(documents);
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
      res.status(500).json({ error: 'Error al obtener los documentos' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { name, password } = req.body;
    try {
      const users = database.collection('usuarios');
      const daycares = database.collection('guarderias');
      const user = await users.findOne({ nombre: name });
      if (!user || !verifyPassword(password, user.password_hash)) {
        return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
      }

      let daycare = null;
      if (user.id_roles === 2) {
        const daycareRecord = await daycares.findOne({ id_usuario_gerente: user._id });
        if (daycareRecord) {
          daycare = normalizeDaycareForResponse(daycareRecord);
        }
      }

      return res.json({
        success: true,
        roleId: user.id_roles,
        userId: String(user._id),
        daycare,
      });
    } catch (error) {
      console.error('Error durante la autenticación:', error);
      return res.status(500).json({ success: false, message: 'Error de autenticación' });
    }
  });

  const server = await new Promise((resolve) => {
    const instance = app.listen(DEFAULT_PORT, () => {
      console.log(`Backend escuchando en http://localhost:${DEFAULT_PORT}`);
      resolve(instance);
    });
  });

  const shutdown = async () => {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    await client.close();
  };

  return { app, server, client, shutdown };
}

module.exports = { createServer };
