'use strict';

var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');

var jwt = require('../services/jwt');
const user = require('../models/user');



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

function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId)
        .then(user => {
            if (user) {
                res.status(200).send({ user });
            } else {
                res.status(404).send({ message: 'El usuario no existe' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ message: 'Error en la petición' });
        }); 
}

// Devolver usuarios paginados
function getUsers(req, res) {
    const identity_user_id = req.user.sub;
    let page = parseInt(req.params.page, 10) || 1; // Página por defecto
    const itemsPerPage = 5; // Número de usuarios por página

    User.paginate({}, { page: page, limit: itemsPerPage, sort: { _id: 1 } })
        .then(result => {
            if (!result || result.docs.length === 0) {
                return res.status(404).send({ message: 'No hay usuarios disponibles' });
            }

            // Total de usuarios y páginas
            const totalUsers = result.totalDocs;
            const totalPages = Math.ceil(totalUsers / itemsPerPage); 

            return res.status(200).send({
                users: result.docs,
                total: totalUsers,
                pages: totalPages,
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send({ message: 'Error en la petición' });
        });
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    // Borrar la propiedad password
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para actualizar los datos del usuario' });
    }

    User.findByIdAndUpdate(userId, update, { new: true })
        .then(userUpdated => {
            if (!userUpdated) {
                return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
            }
            return res.status(200).send({ user: userUpdated });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send({ message: 'Error en la petición' });
        });
}

const fs = require('fs');

function uploadImage(req,res) {
    var userId = req.params.id;

    if(req.files) {
        var file_path = req.files.image.path;
        console.log(file_path);
        var file_split = file_path.split('\\');
        console.log(file_split);
        var file_name = file_split[2];
        console.log(file_name);
        var ext_split = file_name.split('\.');
        console.log(ext_split);
        var file_ext = ext_split[1];
        console.log(file_ext);
        if(userId != req.user.sub){
            return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos del usuario');
        }

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' || file_ext == 'svg') {
            //Actualizar documento de usuario logueado
            User.findByIdAndUpdate(userId, {image:file_name}, {new:true}).then(userUpdated => {
                if(!userUpdated){
                    res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                } else {
                    res.status(200).send({user: userUpdated, image: file_name});
                }
            });
    } else {
        return removeFilesOfUploads(res, file_path, 'Extensión no válida');
    }
}

}
function removeFilesOfUploads(res, file_path, message){
    fs.unlink(file_path, (err) => {
        return res.status(200).send({message: message});
    });
}

const path = require('path');

function getImageFile(req, res) {
    const image_file = req.params.imageFile;
    const path_file = path.join(__dirname, '../uploads/users', image_file);

    fs.promises.access(path_file, fs.constants.F_OK)
        .then(() => {
            res.sendFile(path.resolve(path_file));
        })
        .catch(() => {
            res.status(404).send({ message: 'No existe la imagen...' });
        });
}

//Exportar las funciones para que esten disponibles en otros archivos
module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile
};  




