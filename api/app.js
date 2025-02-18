'use strict';

var express = require('express');
var bodyParser = require('body-parser');    
const cors = require('cors');
var app = express();

// Cargar las rutas
var user_routes = require('../api/routes/user');
var follow_routes = require('../api/routes/follow');
var publication_routes = require('../api/routes/publication');
var message_routes = require('../api/routes/message');

// Middlewares

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Cors
app.use(cors({
    origin: 'http://localhost:4200', // URL de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE']}));
    
app.use(express.json());

app.get('/api', (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde el servidor de NodeJS'
    });
});

app.listen(3000, () => {
    console.log('Servidor backend corriendo en http://localhost:3000');
});

// configurar cabeceras http
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
})

// Rutas

app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);

// Exportar

module.exports = app;
