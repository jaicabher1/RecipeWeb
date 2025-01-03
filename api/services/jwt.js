'use strict';   

var jwt = require('jwt-simple');
var moment = require('moment'); 
var secret = 'clave_secreta_del_tfg_de_jaime_caballero_en_2025';
exports.createToken = function(user){
    var payload = {
        // Sub: Subject (sujeto) es el identificador del token
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        nick: user.nick,
        role: user.role,
        bio: user.bio,
        location: user.location,
        isVerified: user.isVerified,
        image: user.image,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        // Fecha de creación del token
        iat: moment().unix(),
        // Fecha de expiración del token
        exp: moment().add(30, 'days').unix()
    };
    return jwt.encode(payload, secret);
}