import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.config.js'; 

// Importa todas tus rutas
import authRoutes from './controllers/authController.js';
import heroRoutes from './controllers/heroController.js';
import petRoutes from './controllers/petController.js';
import gameRoutes from './controllers/gameController.js';
import accessoryRoutes from './controllers/accessoryController.js';

connectDB(); 

const app = express();

app.use(cors());
app.use(express.json());

// --- ESTE ES EL ORDEN CORRECTO Y CORREGIDO ---

// 1. Ruta de bienvenida (MÁXIMA PRIORIDAD)
// Cuando alguien visita la raíz, siempre se sirve welcome.html primero.
app.get('/', (req, res) => {
    res.sendFile('public/welcome.html', { root: '.' });
});

// 2. Archivos estáticos (imágenes, CSS, otros HTML)
// Se sirve DESPUÉS para que la ruta de arriba tenga prioridad.
app.use(express.static('public'));

// 3. Rutas de la API (con el prefijo /api)
app.use('/api', authRoutes);
app.use('/api', heroRoutes);
app.use('/api', petRoutes);
app.use('/api', gameRoutes);
app.use('/api', accessoryRoutes);

// 4. Documentación de Swagger (al final)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// El puerto ahora lo tomará de una variable de entorno que Render nos da.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});