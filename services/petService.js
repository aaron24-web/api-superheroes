import petRepository from '../repositories/petRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import gameService from './gameService.js';

async function getAllPetsForHero(heroId) {
    return await petRepository.findPetsByHeroId(heroId);
}

async function getPetByIdForHero(petId, heroId) {
    const pet = await petRepository.getPetById(petId);
    if (!pet || pet.heroId !== heroId) {
        throw new Error('Mascota no encontrada o no pertenece a este Héroe.');
    }
    return pet;
}

async function createPetForHero(petData, heroId) {
    const ownerExists = await heroRepository.getHeroById(heroId);
    if (!ownerExists) {
        throw new Error(`El Héroe con id '${heroId}' no existe.`);
    }
    petData.heroId = heroId; // Asigna el ID del héroe a la mascota
    gameService.assignInitialPersonality(petData);
    return await petRepository.addPet(petData);
}

async function updatePetForHero(petId, petData, heroId) {
    await getPetByIdForHero(petId, heroId);
    const allowedUpdates = {
        name: petData.name,
        type: petData.type,
        superpower: petData.superpower
    };
    Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);
    return await petRepository.updatePet(petId, allowedUpdates);
}

async function deletePetForHero(petId, heroId) {
    await getPetByIdForHero(petId, heroId);
    await petRepository.deletePet(petId);
    return { message: "Mascota eliminada exitosamente" };
}

export default {
    getAllPetsForHero,
    getPetByIdForHero,
    createPetForHero,
    updatePetForHero,
    deletePetForHero
};