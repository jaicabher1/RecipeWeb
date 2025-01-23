'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;

var FollowSchema = Schema({
    // El usuario que sigue
    user: { type: Schema.ObjectId, ref: 'User' },
    // El usuario que es seguido
    followed: { type: Schema.ObjectId, ref: 'User' }
});

// Aplica el plugin mongoose-paginate-v2 a tu esquema
FollowSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Follow', FollowSchema);
