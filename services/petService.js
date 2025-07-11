// services/petService.js

import petRepository from '../repositories/petRepository.js';
import heroRepository from '../repositories/heroRepository.js';

// --- FUNCIÓN MODIFICADA ---
// Ahora devuelve solo el nombre del dueño para no repetir información
async function getPetById(id) {
    const pet = (await petRepository.getPets()).find(p => p.id === parseInt(id));

    if (!pet) {
        throw new Error('Mascota no encontrada');
    }

    const owner = (await heroRepository.getHeroes()).find(hero => hero.id === pet.heroId);

    // Devolvemos toda la info de la mascota y solo el nombre del dueño
    return {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        superpower: pet.superpower,
        heroId: pet.heroId,
        dueñoAsignado: owner ? owner.name : "Sin dueño"
    };
}

// --- El resto de las funciones no necesitan cambios ---
async function getAllPetsWithOwners() {
    const pets = await petRepository.getPets();
    const heroes = await heroRepository.getHeroes();
    return pets.map(pet => {
        const owner = heroes.find(hero => hero.id === pet.heroId);
        return {
            id: pet.id,
            nombre: pet.name,
            dueñoAsignado: owner ? owner.name : 'Sin dueño'
        };
    });
}

async function createPet(petData) {
    const heroes = await heroRepository.getHeroes();
    const pets = await petRepository.getPets();

    const ownerExists = heroes.find(h => h.id === petData.heroId);
    if (!ownerExists) throw new Error('El superhéroe dueño especificado no existe');

    const heroIsTaken = pets.find(p => p.heroId === petData.heroId);
    if (heroIsTaken) throw new Error(`El superhéroe ${ownerExists.name} ya tiene una mascota asignada`);

    petData.id = pets.length > 0 ? Math.max(...pets.map(p => p.id)) + 1 : 1;
    pets.push(petData);
    await petRepository.savePets(pets);
    return petData;
}

async function updatePet(id, petData) {
    const pets = await petRepository.getPets();
    const heroes = await heroRepository.getHeroes();
    
    const petIndex = pets.findIndex(p => p.id === parseInt(id));
    if (petIndex === -1) throw new Error('Mascota no encontrada');
    
    if (petData.heroId && petData.heroId !== pets[petIndex].heroId) {
        const newOwnerExists = heroes.find(h => h.id === petData.heroId);
        if (!newOwnerExists) throw new Error('El nuevo superhéroe dueño no existe');

        const newOwnerIsTaken = pets.find(p => p.heroId === petData.heroId);
        if (newOwnerIsTaken) throw new Error(`El superhéroe ${newOwnerExists.name} ya tiene una mascota asignada`);
    }

    pets[petIndex] = { ...pets[petIndex], ...petData };
    await petRepository.savePets(pets);
    return pets[petIndex];
}

async function deletePet(id) {
    let pets = await petRepository.getPets();
    const initialLength = pets.length;
    pets = pets.filter(p => p.id !== parseInt(id));
    if (pets.length === initialLength) throw new Error('Mascota no encontrada para eliminar');
    await petRepository.savePets(pets);
    return { message: 'Mascota eliminada' };
}

export default {
    getPetById,
    getAllPetsWithOwners,
    createPet,
    updatePet,
    deletePet
};