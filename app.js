import express from 'express';
// --- 1. Importa los paquetes de Swagger ---
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Importa tus rutas
import heroRoutes from './controllers/heroController.js';

const app = express();
app.use(express.json());

// --- 2. Define las opciones de Swagger ---
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Superhéroes',
      version: '1.0.0',
      description: 'Documentación para la API de Superhéroes creada en clase.',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Asegúrate que el puerto coincida
      },
    ],
  },
  // La ruta a los archivos que contienen la documentación de la API
  apis: ['./controllers/*.js'], 
};

const specs = swaggerJsdoc(options);

// --- 3. Crea el endpoint para la documentación ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Monta tus rutas de la API
app.use('/', heroRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación de Swagger disponible en http://localhost:${PORT}/api-docs`);
});