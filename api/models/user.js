// Creamos el modelo de usuario en Mongoose

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    surname: { type: String, trim: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor, ingresa un email válido.']
    },
    nick: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['ROLE_ADMIN', 'ROLE_USER'], 
        default: 'ROLE_USER' 
    },
    bio: { type: String, maxlength: 250 }, 
    location: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    image: String, 
    phoneNumber: { 
        type: String, 
        match: [/^\+?[0-9]{10,15}$/, 'Por favor, ingresa un número de teléfono válido.'] 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
