'use strict';

var express = require('express');
var PublicationController = require('../controllers/publication');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');

api.post('/savePublication', md_auth.ensureAuth, PublicationController.savePublication);
module.exports = api;