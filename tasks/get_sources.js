/* global toString: false */
'use strict';

//bem tools modules
var BEM = require('bem'),
    Q = BEM.require('q'),
    LOGGER = BEM.require('./logger'),
    _ = BEM.require('underscore'),

    //application modules
    config = require('../config/config');

/**
 * Retrieves sources configuration and modify it for suitable github API calling
 * @returns {defer.promise|*}
 */
var execute = function() {
    LOGGER.info('step1: - getSources start');

    var def = Q.defer(),
        result = [],
        sources = config.get('sources');

    try {
        Object.getOwnPropertyNames(sources).forEach(function(key) {
            sources[key].forEach(function(source) {
                var owner = source.org || source.user,
                    repositories = source.repositories;

                if(owner && repositories) {
                    repositories.forEach(function(repository) {
                        result.push(_.extend(repository, {
                            user: owner,
                            isPrivate: key === 'private'
                        }));
                    });
                }
            });
        });

        def.resolve(result);
    } catch(err) {
        LOGGER.error(err.message);
        def.reject(err);
    } finally {
        LOGGER.info('step1: - getSources end');
    }
    return def.promise;
};

module.exports = execute;
