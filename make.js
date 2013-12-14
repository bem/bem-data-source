/* global toString: false */
'use strict';

//bem tools modules
var BEM = require('bem'),
    Q = BEM.require('q'),
    LOGGER = BEM.require('./logger'),

    //application modules
    config = require('./config/config'),
    util = require('./libs/util'),

    getSources = require('./tasks/get_sources'),
    resolveRepositories = require('./tasks/sources/resolve_repositories'),
    resolveBranches = require('./tasks/sources/resolve_branches'),
    resolveTags = require('./tasks/sources/resolve_tags'),
    createTargets = require('./tasks/sources/create_targets'),
    executeTargets = require('./tasks/targets/execute_targets'),
    finalize = require('./tasks/targets/finalize'),
    collectResults = require('./tasks/targets/collect_results');

var make = (function() {

    LOGGER.setLevel(config.get('v'));
    LOGGER.info('--- data source start ---');
    Q.allSettled([
        util.createDirectory(config.get('contentDirectory')),
        util.createDirectory(config.get('outputDirectory'))
    ])
    .then(function() { return getSources(); })
    .then(function(sources) { return resolveRepositories(sources); })
    .then(function(sources) { return resolveTags(sources); })
    .then(function(sources) { return resolveBranches(sources); })
    .then(function(sources) { return createTargets(sources); })
    .then(function(targets) { return executeTargets(targets); })
    .then(function(targets) { return finalize(targets); })
    .then(function(targets) { return collectResults(targets); })
    .then(function() {
        LOGGER.info('--- data source end ---');
    });

})();

