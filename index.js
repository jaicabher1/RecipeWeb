'use strict';

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

// Usa la promesa global en lugar de la promesa interna de Mongoose
mongoose.Promise = global.Promise;

// Conexion a la base de datos
mongoose.connect('mongodb://localhost:27017/RecipeWeb')
    .then(() => { console.log('Connected to MongoDB') 

        // Crear el servidor
        app.listen(port, () => {
            console.log('Server running on http://localhost:' + port);
        });
    })
    .catch((err) => { console.error(err) });
