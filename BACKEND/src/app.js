const express = require('express');
const userRoutes = require('./routes/user.routes');
const mentoriaRoutes = require('./routes/mentoria.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());

app.use('/users', userRoutes);
app.use('/mentorias', mentoriaRoutes);
app.use('/auth', authRoutes);

module.exports = app;