import petRepository from '../repositories/petRepository.js';
import accessoryRepository from '../repositories/accessoryRepository.js'; // Importamos el nuevo repositorio

// --- Estado del Juego y Constantes ---
let activePetId = null;

const PERSONALITIES = ['Cariñoso', 'Enojón', 'Deprimido'];
const SICKNESSES = {
    gripa: 1,
    'dolor de estomago': 1,
    sarna: 2,
};
const HP_DECAY_RATE_PER_MINUTE = 1;
const PERSONALITY_DECAY_RATE_PER_30S = 1;

// --- Funciones Auxiliares ---

/**
 * Actualiza el estado de la mascota ('excelente', 'muerto', etc.) basado en sus puntos de vida.
 */
function updatePetStatus(pet) {
    if (pet.health <= 0) {
        pet.status = 'muerto';
        pet.health = 0;
    } else if (pet.health <= 1) {
        pet.status = 'débil';
    } else if (pet.health <= 5) {
        pet.status = 'preocupante';
    } else {
        pet.status = 'excelente';
    }
}

/**
 * Guarda el estado completo y actualizado de una mascota en el archivo JSON.
 */
async function savePetState(petToSave) {
    const allPets = await petRepository.getPets();
    const index = allPets.findIndex(p => p.id === petToSave.id);
    if (index !== -1) {
        allPets[index] = petToSave;
        await petRepository.savePets(allPets);
    }
}

/**
 * Revisa si los accesorios equipados han expirado y los desequipa.
 */
function checkExpiredAccessories(pet) {
    const now = new Date();
    for (const type in pet.equippedAccessories) {
        const equipped = pet.equippedAccessories[type];
        if (equipped) {
            const equippedTime = new Date(equipped.equipTimestamp);
            const minutesPassed = (now - equippedTime) / 60000;
            if (minutesPassed > equipped.duracion_minutos) {
                pet.equippedAccessories[type] = null;
            }
        }
    }
}

/**
 * Calcula y aplica el decaimiento de vida pasivo basado en el tiempo transcurrido.
 */
function applyTimeBasedDecay(pet) {
    const now = new Date();
    const lastUpdated = new Date(pet.lastUpdated);
    const secondsPassed = Math.floor((now - lastUpdated) / 1000);

    if (secondsPassed > 0) {
        let healthLost = 0;
        healthLost += (secondsPassed / 60) * HP_DECAY_RATE_PER_MINUTE;
        if (pet.illness) {
            healthLost += (secondsPassed / 60) * (SICKNESSES[pet.illness] || 0);
        }
        if (pet.personality !== pet.originalPersonality) {
            healthLost += (secondsPassed / 30) * PERSONALITY_DECAY_RATE_PER_30S;
        }
        if (healthLost > 0) {
            pet.health -= Math.floor(healthLost);
        }
        pet.lastUpdated = now.toISOString();
        updatePetStatus(pet);
    }
    return pet;
}

// --- Lógica Principal del Servicio de Juego ---

/**
 * Función CLAVE: Obtiene la mascota activa y aplica todas las actualizaciones de estado pasivas.
 */
async function getActivePet(checkIfDead = true) {
    if (!activePetId) throw new Error('Debes seleccionar una mascota primero con /game/select-pet/{id}');
    
    let pet = (await petRepository.getPets()).find(p => p.id === activePetId);
    if (!pet) {
        activePetId = null;
        throw new Error('La mascota activa ya no existe. Por favor, selecciona otra.');
    }

    checkExpiredAccessories(pet);
    pet = applyTimeBasedDecay(pet);

    if (checkIfDead && pet.health <= 0) {
        await savePetState(pet);
        throw new Error(`${pet.name} está muerto y no puede realizar acciones.`);
    }
    
    return pet;
}

async function selectPet(petId) {
    const pet = (await petRepository.getPets()).find(p => p.id === parseInt(petId));
    if (!pet) throw new Error('La mascota seleccionada no existe.');
    
    activePetId = parseInt(petId);
    return pet;
}

function logout() {
    if (!activePetId) throw new Error('No hay ninguna mascota activa para cerrar sesión.');
    activePetId = null;
    return { message: `Sesión cerrada.` };
}

async function getStatus() {
    const pet = await getActivePet(false);
    await savePetState(pet);
    return {
        id: pet.id,
        nombre: pet.name,
        vida: pet.health,
        estado: pet.status,
        monedas: pet.coins,
        enfermedad: pet.illness || "Ninguna",
        personalidad: pet.personality,
        personalidad_original: pet.originalPersonality,
        ultima_actualizacion: pet.lastUpdated,
        inventario: pet.inventory,
        accesorios_equipados: pet.equippedAccessories
    };
}

async function feedPet() {
    let pet = await getActivePet();
    if (pet.health >= 10) throw new Error(`${pet.name} ya estaba lleno.`);
    
    pet.health = Math.min(10, pet.health + 3);
    pet.coins += 5;
    pet.lastUpdated = new Date().toISOString();
    updatePetStatus(pet);
    await savePetState(pet);
    return { message: `Has alimentado a ${pet.name}.`, estado_actual: await getStatus() };
}

async function walkPet() {
    let pet = await getActivePet();
    if (pet.health >= 10) throw new Error(`${pet.name} ya tenía energía al máximo.`);
    
    pet.health = Math.min(10, pet.health + 2);
    pet.coins += 3;
    pet.lastUpdated = new Date().toISOString();
    updatePetStatus(pet);
    await savePetState(pet);
    return { message: `${pet.name} ha salido a pasear.`, estado_actual: await getStatus() };
}

async function curePet() {
    let pet = await getActivePet(false);
    if (!pet.illness && pet.health > 0) return { message: `${pet.name} no está enfermo.`, estado_actual: await getStatus() };
    
    pet.illness = null;
    if (pet.health <= 0) pet.health = 1;
    pet.lastUpdated = new Date().toISOString();
    updatePetStatus(pet);
    await savePetState(pet);
    return { message: `${pet.name} ha sido curado.`, estado_actual: await getStatus() };
}

async function revertPersonality() {
    let pet = await getActivePet();
    if (pet.personality === pet.originalPersonality) return { message: `${pet.name} ya tiene su personalidad original.`, pet: await getStatus() };
    
    pet.personality = pet.originalPersonality;
    pet.lastUpdated = new Date().toISOString();
    await savePetState(pet);
    return { message: `La personalidad de ${pet.name} ha sido restaurada.`, pet: await getStatus() };
}

function assignInitialPersonality(pet) {
    const randomPersonality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    pet.personality = randomPersonality;
    pet.originalPersonality = randomPersonality;
    pet.lastUpdated = new Date().toISOString();
}

async function buyAccessory(accessoryId) {
    let pet = await getActivePet();
    const accessories = await accessoryRepository.getAccessories();
    const accessoryToBuy = accessories.find(a => a.id === parseInt(accessoryId));

    if (!accessoryToBuy) throw new Error('El accesorio no existe.');
    if (pet.inventory.includes(accessoryToBuy.id)) throw new Error('Ya posees este accesorio.');
    if (pet.coins < accessoryToBuy.costo) throw new Error(`No tienes suficientes monedas. Necesitas ${accessoryToBuy.costo}, pero tienes ${pet.coins}.`);

    pet.coins -= accessoryToBuy.costo;
    pet.inventory.push(accessoryToBuy.id);
    pet.lastUpdated = new Date().toISOString();
    
    await savePetState(pet);
    return { message: `Has comprado "${accessoryToBuy.nombre}".`, estado_actual: await getStatus() };
}

async function equipAccessory(accessoryId) {
    let pet = await getActivePet();
    const accessories = await accessoryRepository.getAccessories();
    const accessoryToEquip = accessories.find(a => a.id === parseInt(accessoryId));

    if (!accessoryToEquip) throw new Error('El accesorio no existe.');

    if (accessoryToEquip.costo > 0 && !pet.inventory.includes(accessoryToEquip.id)) {
        throw new Error('No posees este accesorio. Cómpralo primero.');
    }
    
    const { tipo } = accessoryToEquip; // 'lentes', 'ropa', 'sombrero'
    if (!pet.equippedAccessories.hasOwnProperty(tipo)) throw new Error('Tipo de accesorio no válido.');
    
    pet.equippedAccessories[tipo] = {
        id: accessoryToEquip.id,
        nombre: accessoryToEquip.nombre,
        duracion_minutos: accessoryToEquip.duracion_minutos,
        equipTimestamp: new Date().toISOString()
    };
    pet.lastUpdated = new Date().toISOString();
    
    await savePetState(pet);
    return { message: `Has equipado a ${pet.name} con "${accessoryToEquip.nombre}".`, estado_actual: await getStatus() };
}

export default {
    selectPet,
    logout,
    getStatus,
    feedPet,
    walkPet,
    curePet,
    revertPersonality,
    assignInitialPersonality,
    buyAccessory,
    equipAccessory
};