'use strict';

var express = require('express');
var PublicationController = require('../controllers/publication');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/publications' });


api.post('/save-publication', md_auth.ensureAuth, PublicationController.savePublication);
api.put('/update-publication/:id', md_auth.ensureAuth, PublicationController.updatePublication)
api.delete('/delete-publication/:id', md_auth.ensureAuth, PublicationController.deletePublication)
api.get('/publication/:id', md_auth.ensureAuth, PublicationController.getPublication);
api.get('/followed-publications', md_auth.ensureAuth, PublicationController.getFollowedPublications);
api.post('/upload-image-pub/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadImage);
api.get('/get-image-pub/:imageFile', PublicationController.getImageFile);
api.get('/getmypublications', md_auth.ensureAuth, PublicationController.getMyPublications);
api.post('/like/:publicationId', md_auth.ensureAuth, PublicationController.sendLike);
api.delete('/like/:publicationId', md_auth.ensureAuth, PublicationController.deleteLike);
api.get('/numLikes/:publicationId', md_auth.ensureAuth, PublicationController.getLikes);
api.post('/comment/:publicationId', md_auth.ensureAuth, PublicationController.sendComment);
api.delete('/comment/:commentId', md_auth.ensureAuth, PublicationController.deleteComment);
api.get('/numComments/:publicationId', md_auth.ensureAuth, PublicationController.getComments);

module.exports = api;