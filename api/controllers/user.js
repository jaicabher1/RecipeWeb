'use strict';

var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');
const e = require('express');

function home(req, res){
    res.status(200).send({message: 'Hola Munda desde el servidor de NodeJS'});
};

function pruebas(req, res){
    res.status(200).send({message: 'Accion de pruebas en el servidor de NodeJS'});
};

function saveUser(req, res){
    var params = req.body;
    var user = new User();

    if(params.name && params.email 
        && params.nick && params.password ){
        user.name = params.name;
        user.surname = null;
        user.email = params.email;
        user.nick = params.nick;

        user.role = 'ROLE_USER';
        user.bio = null;
        user.location = null;
        user.isVerified = null;
        user.image = null;
        user.phoneNumber = null;
        user.createdAt = Date.now();
        console.log(user);

        bcrypt.hash(params.password, null, null, (err, hash) => {
            user.password = hash;

            user.save().then((userStored) => {
                if (err) {
                    console.log(err);  // Esto te ayudará a ver el error específico
                    return res.status(500).send({message: 'Error al guardar el usuario'});
                }
                if (userStored) {
                    console.log('Usuario guardado:', userStored);
                    res.status(200).send({user: userStored});
                } else {
                    res.status(404).send({message: 'No se ha registrado el usuario'});
                }
            });
        });

    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }


    


}

//Exportar las funciones para que esten disponibles en otros archivos
module.exports = {
    home,
    pruebas,
    saveUser
};  