'use strict'

var path = require('path');
var fs = require('fs');
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

module.exports = {
    savePublication
};