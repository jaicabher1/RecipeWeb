'use strict';

var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');

var jwt = require('../services/jwt');
const user = require('../models/user');



function home(req, res){
    res.status(200).send({message: 'Hola Munda desde el servidor de NodeJS'});
};

function saveUser(req, res) { 
    const params = req.body;
    const user = new User();

    // Verifica si los campos obligatorios están presentes
    if (params.name && params.email && params.nick && params.password) {
        user.name = params.name;
        user.surname = params.surname || null; // Si no se pasa apellido, se asigna null
        user.email = params.email.toLowerCase();
        user.nick = params.nick.toLowerCase();
        
        // Busca si ya existe un usuario con el mismo email o nick
        User.find({ 
            $or: [
                { email: user.email },
                { nick: user.nick }
            ] 
        }).exec()
            .then((users) => {
                if (users && users.length >= 1) {
                    return res.status(400).send({ message: 'El usuario que intentas registrar ya existe!!' });
                } else {
                    user.role = 'ROLE_USER';
                    // Aquí, asignamos los valores correctamente desde params
                    user.bio = params.bio || null; 
                    user.location = params.location || null; 
                    user.isVerified = params.isVerified || null; // Asignar null o el valor real si es proporcionado
                    user.image = params.image || null; 
                    user.phoneNumber = params.phoneNumber || null;
                    user.createdAt = Date.now();

                    // Cifra la contraseña
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        if (err) return res.status(500).send({ message: 'Error al cifrar la contraseña' });

                        user.password = hash;

                        // Guarda el nuevo usuario en la base de datos
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
            // Compara la contraseña en texto claro con la cifrada en la base de datos
            bcrypt.compare(password, user.password, check => {
                if (check) {
                    // Si se pide el token
                    if (params.gettoken) {
                        // Generar y devolver el token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        // Devolver datos del usuario (sin la contraseña)
                        user.password = undefined;
                        res.status(200).send({ user });
                    }
                } else {
                    res.status(404).send({ message: 'Contraseña incorrecta' });
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
                followThisUser(req.user.sub, userId)
                    .then((value) => {
                        res.status(200).send({ user, following: value.following, followed: value.followed });
                    })
            } else {
                res.status(404).send({ message: 'El usuario no existe' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ message: 'Error en la petición' });
        }); 
}

async function followThisUser(identity_user_id, user_id) {
    try {
        const following = await Follow.findOne({ user: identity_user_id, followed: user_id });
        const followed = await Follow.findOne({ user: user_id, followed: identity_user_id });

        return {
            following: following,
            followed: followed
        };
    } catch (err) {
        console.error(err);
        return err;
    }
}

async function followUserIds(user_id) {
    try {
        const following = await Follow.find({ user: user_id }).select({ _id: 0, __v: 0, user: 0 });
        const followed = await Follow.find({ followed: user_id }).select({ _id: 0, __v: 0, followed: 0 }).exec();
        const following_clean = [];
        following.forEach((follow) => {
            following_clean.push(follow.followed);
        });
        const followed_clean = [];
        followed.forEach((follow) => {
            followed_clean.push(follow.user);
        });
        return {
            following: following_clean,
            followed: followed_clean
        };
    } catch (err) {
        console.error(err);
        return err;
    }
    
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
            followUserIds(identity_user_id).then((value) => {
                return res.status(200).send({
                    users: result.docs,
                    users_following: value.following,
                    users_follow_me: value.followed,
                    total: totalUsers,
                    pages: totalPages,
                });
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
        return res.status(403).send({ message: 'No tienes permiso para actualizar los datos del usuario' });
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
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
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

function getCounters(req, res){
    let userId = req.user.sub;
    if(req.params.id){
        userId = req.params.id;
    }
    getCountFollow(userId).then((value) => {
        return res.status(200).send(value);
    });
}

async function getCountFollow(userId) {
    var following = await Follow.countDocuments({ user: userId });
    var followed = await Follow.countDocuments({ followed: userId });
    var publications = await Publication.countDocuments({ user: userId });
    return {
        following: following,
        followed: followed,
        publications: publications
    };
    
}

//Exportar las funciones para que esten disponibles en otros archivos
module.exports = {
    home,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile,
    getCounters
};  




