var FS = require('fs'),
    CP = require('child_process'),

    BEM = require('bem'),
    Q = BEM.require('q'),
    QIO_FS = BEM.require('q-io/fs'),
    PATH = BEM.require('./path'),
    LOGGER = BEM.require('./logger'),
    U = BEM.require('./util'),

    config = require('../config/config');

exports.createContentDirectory = function() {
    return QIO_FS
        .makeDirectory(config.get('contentDirectory'))
        .then(function() {
            LOGGER.info(config.get("messages")["contentDirectory"]["created"]);
        })
        .fail(function(err) {
            if(err.code == 'EEXIST')
                LOGGER.warn(config.get("messages")["contentDirectory"]["exist"])
        });
};
