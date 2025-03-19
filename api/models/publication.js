// Crear modelo publicacion

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublicationSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Desayuno', 'Almuerzo', 'Cena', 'Postre', 'Snack', 'Vegano', 'Vegetariano', 'Sin Gluten', 'Sin Lactosa'], 
        required: true 
    },
    description: { type: String, required: true },
    ingredients: { type: [String], required: true }, 
    steps: { type: String, required: true },
    views: { type: Number, default: 0 },
    tags: { 
        type: [String], 
        enum: ['Rápido','Vegetariano','Dulce', 'Fácil', 'Saludable', 'Económico', 'Internacional', 'Gourmet', 'Tradicional', 'Fiesta', 'Navidad', 'Halloween', 'San Valentín', 'Verano', 'Invierno', 'Otoño', 'Primavera','Internacional','Sin Gluten','Sin Lactosa','Vegano','Vegetariano'], 
    }, 
    difficulty: { 
        type: String, 
        enum: ['Fácil', 'Intermedio', 'Avanzado'], 
        required: true 

    },
    prepTime: { type: Number, required: true },
    image: String , 
    created_at: { type: Date, default: Date.now  }
});

module.exports = mongoose.model('Publication', PublicationSchema);
