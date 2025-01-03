'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowSchema = Schema({
    // El usuario que sigue
    user: { type: Schema.ObjectId, ref: 'User' },
    // El usuario que es seguido
    followed: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Follow', FollowSchema);
