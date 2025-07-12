// services/gameService.js
import petRepository from '../repositories/petRepository.js';

// Esta variable simulará nuestra "sesión".
// Guardará el ID de la mascota con la que estamos jugando.
let activePetId = null;

// Función auxiliar para actualizar el estado de la mascota basado en su vida
function updatePetStatus(pet) {
    if (pet.health <= 0) pet.status = 'muerto';
    else if (pet.health <= 1) pet.status = 'débil';
    else if (pet.health <= 5) pet.status = 'preocupante';
    else pet.status = 'excelente';
}

async function selectPet(petId) {
    const pets = await petRepository.getPets();
    const petExists = pets.find(p => p.id === parseInt(petId));
    if (!petExists) {
        throw new Error('La mascota seleccionada no existe.');
    }
    activePetId = parseInt(petId);
    return petExists;
}

function logout() {
    if (!activePetId) {
        throw new Error('No hay ninguna mascota activa para cerrar sesión.');
    }
    const petId = activePetId;
    activePetId = null;
    return { message: `Sesión con la mascota ${petId} cerrada.` };
}

async function getActivePet() {
    if (!activePetId) {
        throw new Error('Debes seleccionar una mascota primero con /game/select-pet/{id}');
    }
    const pets = await petRepository.getPets();
    const pet = pets.find(p => p.id === activePetId);
    if (!pet) {
        // Esto puede pasar si la mascota fue eliminada mientras estaba seleccionada
        activePetId = null; 
        throw new Error('La mascota activa ya no existe. Por favor, selecciona otra.');
    }
    return pet;
}

async function feedPet() {
    const pet = await getActivePet();
    if (pet.health >= 10) {
        // En la siguiente fase, aquí se enfermará. Por ahora, solo damos un aviso.
        return { message: `${pet.name} ya tiene la vida al máximo. ¡No lo sobrealimentes!`, pet };
    }
    pet.health += 3;
    if (pet.health > 10) pet.health = 10;
    pet.coins += 5; // Gana 5 monedas por ser alimentado
    updatePetStatus(pet);

    const allPets = await petRepository.getPets();
    const index = allPets.findIndex(p => p.id === pet.id);
    allPets[index] = pet;
    await petRepository.savePets(allPets);

    return { message: `${pet.name} ha sido alimentado. Vida +3. Ahora tiene ${pet.health} de vida.`, pet };
}

async function walkPet() {
    const pet = await getActivePet();
    if (pet.health >= 10) {
        return { message: `${pet.name} ya tiene la vida al máximo.`, pet };
    }
    pet.health += 2;
    if (pet.health > 10) pet.health = 10;
    pet.coins += 3; // Gana 3 monedas por pasear
    updatePetStatus(pet);

    const allPets = await petRepository.getPets();
    const index = allPets.findIndex(p => p.id === pet.id);
    allPets[index] = pet;
    await petRepository.savePets(allPets);
    
    return { message: `${pet.name} ha salido a pasear. Vida +2. Ahora tiene ${pet.health} de vida.`, pet };
}

async function getStatus() {
    const pet = await getActivePet();
    // La respuesta solo mostrará lo relevante para el estado del juego
    return {
        id: pet.id,
        nombre: pet.name,
        vida: pet.health,
        estado: pet.status,
        monedas: pet.coins
    };
}


export default {
    selectPet,
    logout,
    feedPet,
    walkPet,
    getStatus
};