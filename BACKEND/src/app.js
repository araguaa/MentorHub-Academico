const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const mentoriaRoutes = require('./routes/mentoria.routes');
const authRoutes = require('./routes/auth.routes');
const disciplinaRoutes = require('./routes/disciplina.routes');
const academicoRoutes = require('./routes/academico.routes');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/mentorias', mentoriaRoutes);
app.use('/auth', authRoutes);
app.use('/disciplinas', disciplinaRoutes);
app.use('/academico', academicoRoutes);

module.exports = app;