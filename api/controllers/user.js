'use strict';

var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');

var jwt = require('../services/jwt');

function home(req, res){
    res.status(200).send({message: 'Hola Munda desde el servidor de NodeJS'});
};

function pruebas(req, res){
    res.status(200).send({message: 'Accion de pruebas en el servidor de NodeJS'});
};

function saveUser(req, res) { 
    const params = req.body;
    const user = new User();

    if (params.name && params.email && params.nick && params.password) {
        user.name = params.name;
        user.surname = null;
        user.email = params.email.toLowerCase();
        user.nick = params.nick.toLowerCase();
        
        User.find({ 
            $or: [
                { email: user.email },
                { nick: user.nick }
            ] 
        }).exec()
            .then((users) => {
                if (users && users.length >= 1) {
                    return res.status(200).send({ message: 'El usuario que intentas registrar ya existe!!' });
                } else {
                    user.role = 'ROLE_USER';
                    user.bio = null;
                    user.location = null;
                    user.isVerified = null;
                    user.image = null;
                    user.phoneNumber = null;
                    user.createdAt = Date.now();

                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        if (err) return res.status(500).send({ message: 'Error al cifrar la contraseña' });

                        user.password = hash;

                        user.save()
                            .then((userStored) => {
                                if (userStored) {
                                    res.status(200).send({ user: userStored });
                                } else {
                                    res.status(404).send({ message: 'No se ha registrado el usuario' });
                                }
                            })
                            .catch((saveErr) => {
                                console.error(saveErr);
                                res.status(500).send({ message: 'Error al guardar el usuario' });
                            });
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send({ message: 'Error en la petición de usuarios' });
            });
    } else {
        res.status(400).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({
        email: email
    }).then(user => {
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    if(params.gettoken){
                        //Generar y devolver el token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //Devolver datos de usuario
                        user.password = undefined;
                        res.status(200).send({ user });
                    }
                } else {
                    res.status(404).send({ message: 'El usuario no se ha podido loguear' });
                }
            });
        } else {
            res.status(404).send({ message: 'No existe el usuario!!!' });
        }
    }).catch(err => {
        console.error(err);
        res.status(500).send({ message: 'Error en la petición' });
    });

}

//Exportar las funciones para que esten disponibles en otros archivos
module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser
};  




