import petRepository from '../repositories/petRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import gameService from './gameService.js'; // Importamos el servicio de juego

// --- Funciones del Servicio de Mascotas (CRUD) ---

async function getPetById(id) {
    const pet = (await petRepository.getPets()).find(p => p.id === parseInt(id));
    if (!pet) throw new Error('Mascota no encontrada');

    const owner = (await heroRepository.getHeroes()).find(hero => hero.id === pet.heroId);

    return {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        superpower: pet.superpower,
        heroId: pet.heroId,
        dueñoAsignado: owner ? owner.name : "Sin dueño"
    };
}

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
    if (heroIsTaken) throw new Error(`El superhéroe ${ownerExists.name} ya tiene una mascota asignada.`);

    // Asigna la personalidad aleatoria al crear
    gameService.assignInitialPersonality(petData); 

    petData.id = pets.length > 0 ? Math.max(...pets.map(p => p.id)) + 1 : 1;
    pets.push(petData);
    await petRepository.savePets(pets);
    return petData;
}

async function updatePet(id, petData) {
    const pets = await petRepository.getPets();
    const petIndex = pets.findIndex(p => p.id === parseInt(id));
    if (petIndex === -1) throw new Error('Mascota no encontrada');

    // Creamos un objeto con solo los datos permitidos para actualizar
    const allowedUpdates = {
        name: petData.name,
        type: petData.type,
        superpower: petData.superpower,
        heroId: petData.heroId
    };

    // Filtramos cualquier campo no permitido que venga en la petición
    Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

    if (allowedUpdates.heroId && allowedUpdates.heroId !== pets[petIndex].heroId) {
        // Validación de dueño (sin cambios)
        const heroes = await heroRepository.getHeroes();
        const newOwnerExists = heroes.find(h => h.id === allowedUpdates.heroId);
        if (!newOwnerExists) throw new Error('El nuevo superhéroe dueño no existe');
        const newOwnerIsTaken = pets.find(p => p.heroId === allowedUpdates.heroId);
        if (newOwnerIsTaken) throw new Error(`El superhéroe ${newOwnerExists.name} ya tiene una mascota asignada.`);
    }

    // Actualizamos la mascota solo con los campos permitidos
    pets[petIndex] = { ...pets[petIndex], ...allowedUpdates };
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

// --- La exportación por defecto es la clave ---
export default {
    getPetById,
    getAllPetsWithOwners,
    createPet,
    updatePet,
    deletePet
};