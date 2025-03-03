'use strict';

var express = require('express');
var FollowController = require('../controllers/follow');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');

api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);
api.delete('/unfollow/:id', md_auth.ensureAuth, FollowController.deleteFollow);
api.get('/following/:id', md_auth.ensureAuth, FollowController.getMyFollows);
api.get('/followers/:id', md_auth.ensureAuth, FollowController.getFollowBacks);


module.exports = api;