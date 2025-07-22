import { connectDB } from './config/db.js';

async function fixData() {
    try {
        const db = await connectDB();
        const petsCollection = db.collection('pets');

        const now = new Date().toISOString();

        // Actualiza todas las mascotas para que tengan los campos del juego
        const result = await petsCollection.updateMany(
            {}, // El filtro vacío {} significa "aplicar a todos los documentos"
            { 
                $set: { 
                    lastUpdated: now,
                    health: 10,
                    status: "excelente",
                    coins: 0,
                    illness: null,
                    inventory: [],
                    equippedAccessories: { lentes: null, ropa: null, sombrero: null }
                } 
            }
        );

        console.log(`✅ Datos de juego actualizados para ${result.modifiedCount} mascotas.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la actualización de datos:', error);
        process.exit(1);
    }
}

fixData();