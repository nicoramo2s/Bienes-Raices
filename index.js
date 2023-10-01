/*const express = require('express')*///Common JS
import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import db from './config/db.js';

//Crear la APP
const app = express();

//Habilita datos de Formulario
app.use(express.urlencoded({ extended: true }));

//Habilitar CookieParser
app.use(cookieParser());

//Habilitar CSRF
app.use(csrf({ cookie: true }));

//Conexion a la base de datos
try {
    await db.authenticate();
    db.sync();
    console.log('------Conexion a la base de datos correcta');
} catch (error) {
    console.log(error);
}

//Habilitar Pug
app.set('view engine', 'pug');
app.set('views', './views');

//Carpeta publica
app.use(express.static('public'));

//Routing
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);

//Definir un puerto y arrancar el puerto
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`---------El servidor esta funcionando en el puerto ${PORT}`);
});
