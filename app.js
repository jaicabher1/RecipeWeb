'use strict';

var express = require('express');
var bodyParser = require('body-parser');    

var app = express();

// Cargar las rutas

// Middlewares

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Cors

// Rutas
app.get('/', (req, res) => {
    res.status(200).send({message: 'Hola Munda desde el servidor de NodeJS'});
});

// Exportar

module.exports = app;
