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
const like = require('../models/like');
const comment = require('../models/comment');

async function savePublication(req, res) {
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
            publication.created_at = Date.now();

            const publicationStored = await publication.save();
            if (!publicationStored) {
                return res.status(404).send({ message: 'Error al guardar la publicación' });
            }
            return res.status(200).send({ publication: publicationStored });

        } else {
            return res.status(200).send({ message: 'Envía todos los campos necesarios' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}


async function updatePublication(req, res) {
    try {
        var update = req.body;
        var publicationId = req.params.id
        const publication = await Publication.findById(publicationId);


        if (publication.user != req.user.sub) {
            return res.status(403).send({ message: 'No tienes permiso para actualizar esta publicación' });
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

        if (!publication) {
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
        let userId = req.user.sub;
        if(req.params.userId != null) userId = req.params.userId;
    
        const publications = await Publication.find({ user: userId }).sort('-createdAt').exec();

        if (!publications || publications.length === 0) {
            return res.status(404).send({ message: 'No hay publicaciones' });
        }

        return res.status(200).send({ publications });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor', error: err.message });
    }
}



async function getPublication(req, res) {
    try {
        const publicationId = req.params.id;
        const userId = req.user.sub;
        const publication = await Publication.findById(publicationId);
        const follow = await Follow.findOne({ user: userId, followed: publication.user._id });

        if (!publication) {
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
function uploadImage(req, res) {
    var publicationId = req.params.id;

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];


        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' || file_ext == 'svg') {
            //Actualizar documento de usuario logueado
            Publication.findOne({ user: req.user.sub, _id: publicationId }).then(publication => {
                if (publication) {
                    Publication.findByIdAndUpdate(publicationId, { image: file_name }, { new: true }).then(publicationUpdated => {
                        if (!publicationUpdated) {
                            res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
                        } else {
                            res.status(200).send({ publication: publicationUpdated, image: file_name });
                        }
                    });
                } else {
                    res.status(404).send({ message: 'No tienes permiso para actualizar esta publicación' });
                }
            });
        } else {
            return removeFilesOfUploads(res, file_path, 'Extensión no válida');
        }
    }

}
function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
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

async function sendLike(req, res) {
    try {
        const publicationId = req.params.publicationId;
        const userId = req.user.sub;

        // Obtener publicación para saber el autor
        const publication = await Publication.findById(publicationId);
        if (!publication) {
            return res.status(404).send({ message: 'Publicación no encontrada' });
        }

        // Si la publicación es del mismo usuario logueado, se permite dar like
        if (publication.user.toString() !== userId) {
            const follow = await Follow.findOne({ user: userId, followed: publication.user });
            if (!follow) {
                return res.status(403).send({ message: 'No puedes dar like porque no sigues al autor de la publicación' });
            }
        }

        // Verificar si ya le dio like
        const existingLike = await like.findOne({ user: userId, publication: publicationId });
        if (existingLike) {
            return res.status(200).send({ message: 'Ya le diste like a esta publicación' });
        }

        // Guardar nuevo like
        const newLike = new like({
            user: userId,
            publication: publicationId,
        });

        const likeStored = await newLike.save();
        return res.status(200).send({ like: likeStored });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

async function deleteLike(req, res) {
    try {
        const publicationId = req.params.publicationId;
        const userId = req.user.sub;

        const likeDeleted = await like.findOneAndDelete({ user: userId, publication: publicationId });
        if (!likeDeleted) {
            return res.status(404).send({ message: 'No se ha encontrado el like' });
        }

        return res.status(200).send({ message: 'Like eliminado correctamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

async function getLikes(req, res) {
    try {
        const publicationId = req.params.publicationId;
        const currentUserId = req.user.sub;

        // Obtener la publicación y el autor
        const publication = await Publication.findById(publicationId);
        if (!publication) {
            return res.status(404).send({ message: 'Publicación no encontrada' });
        }

        // Si el usuario no es el autor, comprobar si lo sigue
        if (publication.user.toString() !== currentUserId) {
            const follow = await Follow.findOne({
                user: currentUserId,
                followed: publication.user
            });

            // Si no sigue al autor, denegar acceso
            if (!follow) {
                return res.status(403).send({ message: 'No tienes permiso para ver los likes de esta publicación' });
            }
        }

        // Obtener likes
        const likes = await like.find({ publication: publicationId })
            .populate('user', 'name surname nick image') // opcional: campos a mostrar
            .sort('-createdAt');

        // Contador total de likes
        const totalLikes = likes.length;

        return res.status(200).send({ likes, totalLikes });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

async function sendComment(req, res) {
    try {
        const publicationId = req.params.publicationId;
        const userId = req.user.sub;
        const text = req.body.text;

        if (!text || !text.trim()) {
            return res.status(400).send({ message: 'El comentario no puede estar vacío' });
        }

        const publication = await Publication.findById(publicationId);
        if (!publication) {
            return res.status(404).send({ message: 'Publicación no encontrada' });
        }

        // Validación de seguimiento si no es el dueño
        if (publication.user.toString() !== userId) {
            const follow = await Follow.findOne({ user: userId, followed: publication.user });
            if (!follow) {
                return res.status(403).send({ message: 'No puedes comentar porque no sigues al autor de la publicación' });
            }
        }

        const newComment = new comment({
            user: userId,
            publication: publicationId,
            text,
            created_at: new Date()
        });

        const commentStored = await newComment.save();
        return res.status(200).send({ comment: commentStored });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

async function deleteComment(req, res) {
    try {
        const commentId = req.params.commentId;
        const userId = req.user.sub;

        // Solo puede eliminarlo el autor del comentario
        const deleted = await comment.findOneAndDelete({ _id: commentId, user: userId });
        if (!deleted) {
            return res.status(404).send({ message: 'Comentario no encontrado o no tienes permisos' });
        }

        return res.status(200).send({ message: 'Comentario eliminado correctamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

async function getComments(req, res) {
    try {
        const publicationId = req.params.publicationId;
        const userId = req.user.sub;

        const publication = await Publication.findById(publicationId);
        if (!publication) {
            return res.status(404).send({ message: 'Publicación no encontrada' });
        }

        if (publication.user.toString() !== userId) {
            const follow = await Follow.findOne({ user: userId, followed: publication.user });
            if (!follow) {
                return res.status(403).send({ message: 'No tienes permiso para ver los comentarios de esta publicación' });
            }
        }

        const comments = await comment.find({ publication: publicationId })
            .populate('user', 'name surname nick image')
            .sort('-created_at');

        const totalComments = comments.length;

        return res.status(200).send({ comments, totalComments });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}



module.exports = {
    savePublication,
    updatePublication,
    deletePublication,
    getPublication,
    getFollowedPublications,
    getImageFile,
    uploadImage,
    getMyPublications,
    sendLike,
    deleteLike,
    getLikes,
    sendComment,
    deleteComment,
    getComments
};