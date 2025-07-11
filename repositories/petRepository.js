import fs from 'fs-extra';
import Pet from '../models/petModel.js';

const filePath = './pets.json';

async function getPets() {
    try {
        const data = await fs.readJson(filePath);
        return data.map(pet => new Pet(
            pet.id, pet.name, pet.type, pet.superpower, pet.heroId
        ));
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        console.error("Error al leer el archivo de mascotas:", error);
        return [];
    }
}

async function savePets(pets) {
    try {
        await fs.writeJson(filePath, pets, { spaces: 2 });
    } catch (error) {
        console.error("Error al guardar el archivo de mascotas:", error);
    }
}

// Exportación correcta como un objeto de funciones
export default {
    getPets,
    savePets
};