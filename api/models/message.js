'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = Schema({
    // El usuario que envia el mensaje
    emitter : { type: Schema.ObjectId, ref: 'User' },
    // El usuario que recibe el mensaje
    receiver : { type: Schema.ObjectId, ref: 'User' },
    text: String,
    viewed: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);