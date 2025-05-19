'use strict';

var moongose = require('mongoose');
var Schema = moongose.Schema;

var CommentSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    publication: { type: Schema.ObjectId, ref: 'Publication' },
    text: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = moongose.model('Comment', CommentSchema);