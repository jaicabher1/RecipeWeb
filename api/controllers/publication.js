'use strict'

var path = require('path');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

async function savePublication(req, res){
    try {
        const params = req.body;
        const publication = new Publication();
        
        if (params.title && params.category && params.description && params.ingredients && params.steps && params.difficulty && params.prepTime) {
            publication.user = req.user.sub;
            publication.title = params.title;
            publication.category = params.category;
            publication.description = params.description;
            publication.ingredients = params.ingredients.toLowerCase();
            publication.steps = params.steps;
            publication.views = 0;
            publication.tags = params.tags.split(',');
            publication.difficulty = params.difficulty;
            publication.prepTime = params.prepTime;
            publication.image = params.image;
            publication.file = params.file;
            publication.created_at = moment().unix();

            const publicationStored = await publication.save();
            if (!publicationStored) {
                return res.status(404).send({message: 'Error al guardar la publicación'});
            }
            return res.status(200).send({publication: publicationStored});
        
        } else {
            return res.status(200).send({message: 'Envía todos los campos necesarios'});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}


async function updatePublication(req, res){
    try {
        var update = req.body;
        var publicationId = req.params.id
        const publication =  await Publication.findById(publicationId);
        
        
        if(publication.user != req.user.sub){
            return res.status(403).send({message: 'No tienes permiso para actualizar esta publicación'});
        }

        const publicationUpdated = await Publication.findByIdAndUpdate(publicationId, update, { new: true });
        if (!publicationUpdated) {
            return res.status(404).send({ message: 'No se ha encontrado la publicacion' });
        }
        return res.status(200).send({ publication: publicationUpdated });
    } catch (err) {
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

async function deletePublication(req, res) {
    try { 
        const publicationId = req.params.id;
        const publication = await Publication.findById(publicationId);

        if(!publication){
            return res.status(404).send({ message: 'No se ha encontrado la publicación' });
        }
        
        if (publication.user != req.user.sub) {
            return res.status(403).send({ message: 'No tienes permiso para borrar esta publicación' });
        }

        const publicationDeleted = await Publication.findOneAndDelete({ _id: publicationId });
        if (!publicationDeleted) {
            return res.status(404).send({ message: 'No se ha encontrado la publicacion' });
        }
        return res.status(200).send({ message: 'Publicacion eliminada correctamente' });    
    } catch (err) {
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

async function getMyPublications(req, res) {
    try {
        const userId = req.user.sub;
        const publications = await Publication.find({ user: userId }).sort('-createdAt').exec();

        if (!publications || publications.length === 0) {
            return res.status(404).send({ message: 'No hay publicaciones' });
        }

        return res.status(200).send({ publications });
    } catch (err) {
        return res.status(500).send({ message: 'Error en el servidor', error: err.message });
    }
}



async function getPublication(req, res) {
    try { 
        const publicationId = req.params.id;
        const userId = req.user.sub;
        const publication = await Publication.findById(publicationId);
        const follow = await Follow.findOne({ user: userId, followed: publication.user._id });

        if(!publication){
            return res.status(404).send({ message: 'No se ha encontrado la publicación' });
        }
        
        if (!follow && publication.user != req.user.sub) {
            return res.status(403).send({ message: 'No tienes permiso para ver esta publicación' });
        }

        return res.status(200).send({ publication });


    } catch (err) {
        return res.status(500).send({ message: 'Error en el servidor' });
    }

}

async function getFollowedPublications(req, res) {
    try {
        const userId = req.user.sub;
        const follows = await Follow.find({ user: userId }).populate('followed');
        const followedIds = follows.map(follow => follow.followed._id);
        const publications = await Publication.find({ user: { $in: followedIds } }).sort('-createdAt');

        return res.status(200).send({ publications });
    } catch (err) {
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

//PROBAR EN POSTMAN
function uploadImage(req,res) {
    var publicationId = req.params.id;

    if(req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' || file_ext == 'svg') {
            //Actualizar documento de usuario logueado
            Publication.findOne({user: req.user.sub, _id: publicationId}).then(publication => {
                if(publication.length > 0){
                    Publication.findByIdAndUpdate(publicationId, {image:file_name}, {new:true}).then(publicationUpdated => {
                        if(!publicationUpdated){
                            res.status(404).send({message: 'No se ha podido actualizar el usuario'});
                        } else {
                            res.status(200).send({publication: publicationUpdated, image: file_name});
                        }
                    });
                } else {    
                    res.status(404).send({message: 'No tienes permiso para actualizar esta publicación'});
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

function getImageFile(req, res) {
    const image_file = req.params.imageFile;
    const path_file = path.join(__dirname, '../uploads/publications', image_file);

    fs.promises.access(path_file, fs.constants.F_OK)
        .then(() => {
            res.sendFile(path.resolve(path_file));
        })
        .catch(() => {
            res.status(404).send({ message: 'No existe la imagen...' });
        });
}


module.exports = {
    savePublication,
    updatePublication,
    deletePublication,
    getPublication,
    getFollowedPublications,
    getImageFile,
    uploadImage,
    getMyPublications
};