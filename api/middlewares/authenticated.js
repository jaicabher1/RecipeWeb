'use strict';

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_del_tfg_de_jaime_caballero_en_2025';

exports.ensureAuth = function (req, res, next) {

    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'La petición no tiene la cabecera de autenticación' });
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');
    console.log('Token recibido:', token);

    try {
        var payload = jwt.decode(token, secret);
        console.log('Payload decodificado:', payload);

        if (payload.exp <= moment().unix()) {
            console.log('Token expirado');
            return res.status(401).send({ message: 'El token ha expirado' });
        }
    } catch (ex) {
        console.error('Error al decodificar el token:', ex);
        return res.status(404).send({ message: 'El token no es válido' });
    }

    req.user = payload;
    console.log('Payload añadido a req.user:', req.user);

    next(); // Llama al siguiente middleware o controlador
};
