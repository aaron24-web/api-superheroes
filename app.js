import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.config.js'; // Importa la configuración
import heroRoutes from './controllers/heroController.js'; // Importa las rutas
import petRoutes from './controllers/petController.js';

const app = express();
app.use(express.json());

// Configura la ruta para la UI de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Configura las rutas de la API
app.use('/', heroRoutes);
app.use('/', petRoutes); 

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación de Swagger disponible en http://localhost:${PORT}/api-docs`);
});