import { connectDB } from '../config/db.js';

async function getAccessories() {
    const db = await connectDB();
    const collection = db.collection('accessories');
    return await collection.find({}).toArray();
}

export default { getAccessories };