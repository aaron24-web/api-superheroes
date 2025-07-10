import express from 'express'
import heroController from './controllers/heroController.js'

const app = express()

app.use(express.json())
app.use('/api', heroController)

const PORT = 3001
app.listen(PORT, _ => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})