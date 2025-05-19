'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate-v2');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');


async function sendMessage(req, res) {
    try {
        var params = req.body;

        if (!params.text || !params.receiver) {
            return res.status(400).send({ message: 'Envia los datos necesarios' });
        }

        var message = new Message();
        message.emitter = req.user.sub;
        message.receiver = params.receiver;
        message.text = params.text;
        message.createdAt = moment().unix();
        message.viewed = 'false';

        // Guardar el mensaje en la base de datos
        let savedMessage = await message.save();

        return res.status(200).send({ message: 'Mensaje guardado correctamente', data: savedMessage });
    } catch (error) {
        return res.status(500).send({ message: 'Error al guardar el mensaje', error });
    }
}

async function getReceivedMessages(req, res) {
    try {
        const userId = req.user.sub;

        const messages = await Message.find({ receiver: userId })
            .populate('emitter', 'name surname _id nick image')
            .sort('-createdAt');

        return res.status(200).send({ messages });
    } catch (error) {
        return res.status(500).send({ message: 'Error en la petición', error });
    }
}


async function getEmittedMessages(req, res) {
    try {
        const userId = req.user.sub;

        const messages = await Message.find({ emitter: userId })
            .populate('receiver', 'name surname _id nick image')
            .sort('-createdAt');

        return res.status(200).send({ messages });
    } catch (error) {
        return res.status(500).send({ message: 'Error en la petición', error });
    }
}


async function getUnviewedMessages(req, res) {
    try {
        var userId = req.user.sub;

        let messages = await Message.countDocuments({ receiver: userId, viewed: 'false' });

        return res.status(200).send({ 'unviewed': messages });
    } catch (error) {
        return res.status(500).send({ message: 'Error en la petición', error });
    }
}

async function setViewedMessages(req, res) {
    try {
        var userId = req.user.sub;
        //Pensar en cambiar solo los de un usuario en concreto

        let messages = await Message.updateMany({ receiver: userId, viewed: 'false' }, { viewed: 'true' }, { "multi": true }); //Con el multi a true actualizamos todos los mensajes

        return res.status(200).send({ messages });
    } catch (error) {
        return res.status(500).send({ message: 'Error en la petición', error });
    }
}



module.exports = {
    sendMessage,
    getReceivedMessages,
    getEmittedMessages,
    getUnviewedMessages,
    setViewedMessages
};

