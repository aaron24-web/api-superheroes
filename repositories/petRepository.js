import fs from 'fs-extra';
import Pet from '../models/petModel.js';

// Apunta al archivo JSON que contiene los datos de las mascotas.
const filePath = './pets.json';

/**
 * Lee todas las mascotas del archivo JSON. Esta función SIEMPRE lee desde el disco
 * para garantizar que los datos estén actualizados.
 * @returns {Promise<Array>} Una promesa que se resuelve con el arreglo de mascotas.
 */
async function getPets() {
    try {
        // Usa fs-extra para leer el archivo JSON y convertirlo en un objeto.
        const data = await fs.readJson(filePath);
        return data;
    } catch (error) {
        // Manejo de error si el archivo no se encuentra.
        if (error.code === 'ENOENT') {
            console.error("ADVERTENCIA: No se pudo encontrar el archivo 'pets.json'. Asegúrate de que exista en la raíz del proyecto. Devolviendo una lista vacía.");
            return []; // Devuelve un arreglo vacío para que la aplicación no falle.
        }
        // Para cualquier otro tipo de error, lo muestra en la consola y lanza una excepción.
        console.error("Error crítico al leer el archivo de mascotas:", error);
        throw error;
    }
}

/**
 * Escribe un arreglo completo de mascotas en el archivo JSON, sobreescribiendo el contenido anterior.
 * @param {Array} pets El arreglo de mascotas a guardar.
 */
async function savePets(pets) {
    try {
        // Usa fs-extra para escribir el objeto en un archivo JSON.
        // La opción { spaces: 2 } formatea el archivo para que sea legible por humanos.
        await fs.writeJson(filePath, pets, { spaces: 2 });
    } catch (error) {
        console.error("Error al guardar los datos en 'pets.json':", error);
    }
}

// Exporta un objeto que contiene las funciones para que puedan ser utilizadas
// por otros módulos, como el 'petService'.
export default {
    getPets,
    savePets
};