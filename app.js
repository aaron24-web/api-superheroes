import express from 'express';
import { connectDB } from './config/db.js'; // <-- ESTA ES LA LÍNEA QUE FALTABA
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.config.js'; 
import heroRoutes from './controllers/heroController.js';
import petRoutes from './controllers/petController.js';
import gameRoutes from './controllers/gameController.js';

// Conectar a la base de datos al iniciar la aplicación
connectDB(); 

const app = express();
app.use(express.json());

// Configura la ruta para la UI de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Configura las rutas de la API
app.use('/', heroRoutes);
app.use('/', petRoutes);
app.use('/', gameRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación de Swagger disponible en http://localhost:${PORT}/api-docs`);
});