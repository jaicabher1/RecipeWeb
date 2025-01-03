'use strict';

var moongose = require('mongoose');
var Schema = moongose.Schema;

/*
Duda:
Es mejor guardar el tipo o hacer relaciones segun
si la notificacion es de publicaciones, comentarios, likes o follow
*/

var NotificationSchema = Schema ({
    user : {type : Schema.ObjectId, ref: 'User'},
    isRead : {
        type : Boolean, 
        default : false},
    createdAt: {
        type: Date,
        default: Date.now
    }})

module.exports = moongose.model('Notification', NotificationSchema);    