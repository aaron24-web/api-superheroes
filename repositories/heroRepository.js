import { connectDB } from '../config/db.js';

// Función para asegurar que el ID sea un número
const toInt = id => parseInt(id, 10);

async function getCollection() {
    const db = await connectDB();
    return db.collection('heroes');
}

async function getHeroes() {
    const collection = await getCollection();
    return await collection.find({}).toArray();
}

async function getHeroById(id) {
    const collection = await getCollection();
    return await collection.findOne({ id: toInt(id) });
}

async function addHero(hero) {
    const collection = await getCollection();
    // Lógica para el autoincremento del ID
    const lastHero = await collection.find().sort({ id: -1 }).limit(1).toArray();
    hero.id = lastHero.length > 0 ? lastHero[0].id + 1 : 1;

    await collection.insertOne(hero);
    return hero;
}

async function updateHero(id, heroData) {
    const collection = await getCollection();
    const { _id, ...updateData } = heroData; // Excluimos _id de MongoDB
    await collection.updateOne({ id: toInt(id) }, { $set: updateData });
    return getHeroById(id);
}

async function deleteHero(id) {
    const collection = await getCollection();
    await collection.deleteOne({ id: toInt(id) });
}

export default { getHeroes, getHeroById, addHero, updateHero, deleteHero };