import fs from 'fs-extra';

// Apunta al archivo JSON que contiene la lista de accesorios.
const filePath = './accesorios.json';

/**
 * Lee la lista completa de accesorios desde el archivo JSON.
 * @returns {Promise<Array>} Una promesa que se resuelve con el arreglo de accesorios.
 */
async function getAccessories() {
    try {
        const data = await fs.readJson(filePath);
        return data;
    } catch (error) {
        // Si el archivo no existe, devuelve una lista vacía para evitar que la app falle.
        if (error.code === 'ENOENT') {
            console.error("ADVERTENCIA: No se encontró 'accesorios.json'. Devolviendo lista vacía.");
            return [];
        }
        // Para cualquier otro error, lo muestra y lanza una excepción.
        console.error("Error crítico al leer el archivo de accesorios:", error);
        throw error;
    }
}

// Exporta un objeto con la función para que pueda ser utilizada por el gameService.
export default {
    getAccessories
};