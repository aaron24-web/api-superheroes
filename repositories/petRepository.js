import { connectDB } from '../config/db.js';

const toInt = id => parseInt(id, 10);

async function getCollection() {
    const db = await connectDB();
    return db.collection('pets');
}

async function getPets() {
    const collection = await getCollection();
    return await collection.find({}).toArray();
}

async function savePets(pets) {
    const collection = await getCollection();
    // Borramos todo y re-insertamos. Es más simple para el estado del juego.
    await collection.deleteMany({});
    if (pets.length > 0) {
        await collection.insertMany(pets);
    }
}

export default { getPets, savePets };