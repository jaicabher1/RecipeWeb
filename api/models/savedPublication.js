'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SavedPublicationSchema = Schema({

    // El usuario que guarda la publicación
    user : { type: Schema.ObjectId, ref: 'User' },
    // La publicación que se guarda
    publication : { type: Schema.ObjectId, ref: 'Publication' }
})

module.exports = mongoose.model('SavedPublication', SavedPublicationSchema);