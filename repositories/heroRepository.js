import { connectDB } from '../config/db.js';
import { ObjectId } from 'mongodb'; // Importa ObjectId para consultar por el ID de usuario

const toInt = id => parseInt(id, 10);

async function getCollection() {
    const db = await connectDB();
    return db.collection('heroes');
}

// MODIFICADO: Ahora filtra los héroes por el ID del usuario
async function getHeroes(userId) {
    const collection = await getCollection();
    // Busca solo los héroes cuyo campo 'userId' coincida con el del usuario logueado
    return await collection.find({ userId: new ObjectId(userId) }).toArray();
}

async function getHeroById(id) {
    const collection = await getCollection();
    return await collection.findOne({ id: toInt(id) });
}

// MODIFICADO: Ahora asocia el nuevo héroe con el ID del usuario
async function addHero(hero, userId) {
    const collection = await getCollection();
    const lastHero = await collection.find().sort({ id: -1 }).limit(1).toArray();
    hero.id = lastHero.length > 0 ? lastHero[0].id + 1 : 1;
    hero.userId = new ObjectId(userId); // <-- Añade la referencia al usuario

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