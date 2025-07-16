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

// --- CONFIGURACIÓN DE CORS MEJORADA ---
const corsOptions = {
    // Acepta peticiones de tu frontend en Render y de tu entorno local de desarrollo
    origin: ['https://api-superheroes-o1b1.onrender.com', 'http://localhost:3000'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// --- FIN DE LA CONFIGURACIÓN ---

app.use(express.json());

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', heroRoutes);
app.use('/', petRoutes);
app.use('/', gameRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación de Swagger disponible en http://localhost:${PORT}/api-docs`);
});