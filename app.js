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

// --- ESTE ES EL CAMBIO MÁS IMPORTANTE ---
// Sirve los archivos estáticos (HTML, CSS, JS del frontend) de la carpeta 'public'.
// Esto hace que tu index.html sea la página principal.
app.use(express.static('public'));

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