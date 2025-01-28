'use strict';

var express = require('express');
var bodyParser = require('body-parser');    

var app = express();

// Cargar las rutas
var user_routes = require('../api/routes/user');
var follow_routes = require('../api/routes/follow');
var publication_routes = require('../api/routes/publication');

// Middlewares

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Cors

// Rutas

app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);

// Exportar

module.exports = app;
