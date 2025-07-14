import fs from 'fs-extra';
import { connectDB } from './config/db.js';

async function migrate() {
    let db;
    try {
        db = await connectDB();
        console.log('Conectado a la base de datos para la migración...');

        // Nombres de las colecciones en MongoDB
        const heroesCollection = db.collection('heroes');
        const petsCollection = db.collection('pets');
        const accessoriesCollection = db.collection('accessories');

        // Limpiar colecciones existentes para evitar duplicados si se corre de nuevo
        await heroesCollection.deleteMany({});
        await petsCollection.deleteMany({});
        await accessoriesCollection.deleteMany({});
        console.log('Colecciones antiguas limpiadas.');

        // Leer datos de los archivos JSON
        const heroes = await fs.readJson('./superheroes.json');
        const pets = await fs.readJson('./pets.json');
        const accessories = await fs.readJson('./accesorios.json');
        console.log('Archivos JSON leídos.');

        // Insertar datos en MongoDB
        if (heroes.length > 0) {
            await heroesCollection.insertMany(heroes);
            console.log(`${heroes.length} héroes insertados.`);
        }
        if (pets.length > 0) {
            await petsCollection.insertMany(pets);
            console.log(`${pets.length} mascotas insertadas.`);
        }
        if (accessories.length > 0) {
            await accessoriesCollection.insertMany(accessories);
            console.log(`${accessories.length} accesorios insertados.`);
        }
        
        console.log('✅ ¡Migración completada exitosamente! Tus datos ahora están en MongoDB Atlas.');
        process.exit(0); // Termina el script exitosamente
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1); // Termina el script con un error
    }
}

migrate();