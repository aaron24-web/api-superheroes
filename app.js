import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.config.js';
import heroRoutes from './controllers/heroController.js';
import petRoutes from './controllers/petController.js';
import gameRoutes from './controllers/gameController.js';

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// --- CAMBIOS PARA LA PÁGINA DE INICIO ---

// 1. Establece welcome.html como la página principal al visitar la raíz del sitio.
app.get('/', (req, res) => {
    // Envía el archivo welcome.html que está en la carpeta 'public'.
    res.sendFile('public/welcome.html', { root: '.' });
});

// 2. Sigue sirviendo todos los archivos de la carpeta 'public' de forma estática.
// Esto es crucial para que welcome.html pueda cargar su CSS y para que el botón "Entrar" funcione.
app.use(express.static('public'));


// --- RUTAS DE LA API Y SWAGGER (Sin cambios) ---

// La documentación de Swagger seguirá disponible en su propia ruta.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Las rutas de la API siguen funcionando igual.
app.use('/', heroRoutes);
app.use('/', petRoutes);
app.use('/', gameRoutes);


// El puerto ahora lo tomará de una variable de entorno que Render nos da.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});