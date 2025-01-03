'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SharedPublicationSchema = Schema({

    // El usuario que envia la publicación
    emisor : { type: Schema.ObjectId, ref: 'User' },
    // El usuario que recibe la publicación
    receiver : { type: Schema.ObjectId, ref: 'User' },
    // La publicación que se enviará
    publication : { type: Schema.ObjectId, ref: 'Publication' },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('SharedPublication', SharedPublicationSchema);