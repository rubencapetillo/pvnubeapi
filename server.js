const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Permitir peticiones desde React

// Configuración de la base de datos en Azure SQL
const config = {
  user: 'pvnube-db',
  password: 'PvCloud2024',
  server: 'pvnube.database.windows.net',
  database: 'pvnube',
  options: {
    encrypt: true, // Azure SQL requiere encriptación
  },
};

// Conexión a la base de datos
sql.connect(config, (err) => {
  if (err) {
    console.log('Error al conectar con la base de datos:', err);
    return;
  }
  console.log('Conectado a Azure SQL Database');
});

// Endpoint para obtener estaciones de trabajo y turnos
app.get('/workstations', async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT WS.NOMBRE AS Workstation, TURNOS.INICIO, TURNOS.FIN, TURNOS.DIASEM 
      FROM POP_WS WS
      JOIN POP_WSTURNO TURNOS ON WS.ID = TURNOS.WS_ID
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Error al obtener los datos de la base de datos');
  }
});

// Endpoint para actualizar turnos
app.post('/update-turn', async (req, res) => {
  const { WS_ID, INICIO, FIN, DIASEM } = req.body;

  try {
    await sql.query(`
      UPDATE POP_WSTURNO
      SET INICIO = '${INICIO}', FIN = '${FIN}', DIASEM = ${DIASEM}
      WHERE WS_ID = '${WS_ID}'
    `);
    res.send('Turno actualizado correctamente');
  } catch (err) {
    res.status(500).send('Error al actualizar el turno');
  }
});

// Iniciar servidor
const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
