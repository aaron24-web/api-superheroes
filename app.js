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

// --- ORDEN CORRECTO DE RUTAS ---

// 1. Ruta de bienvenida (siempre primero)
app.get('/', (req, res) => {
    res.sendFile('public/welcome.html', { root: '.' });
});

// 2. Servidor de archivos estáticos (imágenes, CSS, JS, videos)
// Esto asegura que archivos como fondo2.mp4 se encuentren correctamente.
app.use(express.static('public'));

// 3. Rutas de la API (con el prefijo /api)
// Todas estas rutas requieren lógica del servidor.
app.use('/api', authRoutes);
app.use('/api', heroRoutes);
app.use('/api', petRoutes);
app.use('/api', gameRoutes);
app.use('/api', accessoryRoutes);

// 4. Documentación de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- FIN DEL ORDEN CORRECTO ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});