const express = require('express');
const cors = require('cors'); // 👈 Adicionado aqui
const userRoutes = require('./routes/user.routes');
const mentoriaRoutes = require('./routes/mentoria.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors()); // 👈 Adicionado aqui para liberar o acesso do Frontend
app.use(express.json());

app.use('/users', userRoutes);
app.use('/mentorias', mentoriaRoutes);
app.use('/auth', authRoutes);

module.exports = app;