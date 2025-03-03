'use strict';

var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var User = require('../models/user');
var Follow = require('../models/follow');

async function saveFollow(req, res) {
    try {
        const params = req.body;
        const follow = new Follow();
        follow.user = req.user.sub;
        follow.followed = params.followed;

        const existingUser = await User.findById(follow.followed);
        if (!existingUser) {
            return res.status(404).send({ message: 'El usuario que intentas seguir no existe' });
        }

        const existingFollow = await Follow.findOne({
            user: follow.user,
            followed: follow.followed,
        });
        if (existingFollow) {
            return res.status(200).send({ message: 'Ya sigues a este usuario' });
        }

        const followStored = await follow.save();
        if (!followStored) {
            return res.status(500).send({ message: 'No se pudo guardar el seguimiento' });
        }

        return res.status(200).send({ follow: followStored });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

async function deleteFollow(req, res) {
    try {
        const userId = req.user.sub; 
        const followedId = req.params.id;

        const follow = await Follow.findOneAndDelete({
            user: userId,
            followed: followedId,
        });

        if (!follow) {
            return res.status(404).send({ message: 'No estás siguiendo a este usuario' });
        }

        return res.status(200).send({ message: 'Has dejado de seguir al usuario', follow });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al dejar de seguir al usuario' });
    }
}

//Obtener los usuarios que sigo
async function getMyFollows(req, res) {
    try {
        const userId = req.user.sub; 
        const follows = await Follow.find({ user: userId })
        .populate({
            path: 'followed', 
            select: 'name' 
        })
        .populate({
            path: 'user', 
            select: 'name' 
        });
        if (!follows || follows.length === 0) {
            return res.status(404).send({ message: 'No sigues a ningún usuario' });
        }
        return res.status(200).send({ follows });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

//Obtener los usuarios que me siguen
async function getFollowBacks(req, res) {
    try {
        const userId = req.user.sub; 
        const follows = await Follow.find({ followed: userId })
        .populate({
            path: 'followed', 
            select: 'name' 
        })
        .populate({
            path: 'user', 
            select: 'name' 
        });
        if (!follows || follows.length === 0) {
            return res.status(404).send({ message: 'No sigues a ningún usuario' });
        }
        return res.status(200).send({ follows });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

//Exportar las funciones para que esten disponibles en otros archivos
module.exports = {
    saveFollow,
    deleteFollow,
    getMyFollows,
    getFollowBacks
};  

