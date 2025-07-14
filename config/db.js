import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
    if (db) return db; // Si ya estamos conectados, devolvemos la conexión existente.
    try {
        await client.connect();
        console.log("Conectado exitosamente a MongoDB Atlas");
        db = client.db(process.env.DB_NAME);
        return db;
    } catch (error) {
        console.error("No se pudo conectar a MongoDB", error);
        process.exit(1); // Detiene la aplicación si la conexión a la BD falla.
    }
}

export { connectDB };