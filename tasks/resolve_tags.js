const   UTIL = require('util'),

        //bem tools modules
        BEM = require('bem'),
        Q = BEM.require('q'),
        LOGGER = BEM.require('./logger'),
        _ = BEM.require('underscore'),

        //application modules
        config = require('../config/config'),
        git = require('../libs/git'),
        util = require('../libs/util');

const   TAGS_ALL = 'all',
        TAGS_LAST = 'last';

/**
 * Retrieves information about repository tags and filter them according to config
 * @param sources - {Array} of objects with fields:
 * - user {String} name of user or organization
 * - isPrivate {Boolean} indicate if repository from private github
 * - name - {String} name of repository
 * - targetDir - {String} target directory
 * - docDirs - {Array} array of string path where docs are
 * - type - {String} type of repository. Different engines should be used for different types
 * - tags - {Object} object which holds arrays of tags which should be included or excluded from make process
 * - branches - {Object} object which holds arrays of branches which should be included or excluded from make process
 * - url - {String} git url of repository
 * @returns {defer.promise|*}
 */
var execute = function(sources) {
    LOGGER.info('resolveTags start');

    var def = Q.defer();
    try {
        Q.allSettled(
                sources.map(function(item) {
                    return git.getRepositoryTags(item);
                })
            ).then(function(res) {
                //remove all rejected promises
                res = res.filter(function(item) {
                    return item.state == 'fulfilled';
                });

                res = res.map(function(item) {
                    item = item.value;

                    //return array which contains only tag names
                    var tags = item.result.map(function(tag) {
                        return tag.name;
                    }),
                    source = item.source,
                    resultTags = [];

                    //remove tags which excluded in config
                    //remove tags which not included in config
                    //left only last tag if there 'last' in config
                    //left all tags if there 'all' in config
                    //also exclude rule have greater priority
                    if(source.tags) {
                        var tagsInclude = source.tags['include'],
                            tagsExclude = source.tags['exclude'];

                        if(_.isArray(tagsInclude)) {
                            resultTags = _.intersection(tags, tagsInclude);
                        }else if(_.isString(tagsInclude)) {
                            if(tagsInclude == TAGS_LAST) {
                                resultTags = [_.last(tags.sort(util.sortTags))];
                            }else if(tagsInclude == TAGS_ALL) {
                                resultTags = tags;
                            }
                        }
                        if(_.isArray(tagsExclude)) {
                            resultTags = resultTags.filter(function(tag) {
                                return tagsExclude.indexOf(tag) == -1;
                            });
                        }
                    }

                    resultTags.length > 0 &&
                        LOGGER.info(UTIL.format('repository: %s tags: %s will be executed', source.name, resultTags));

                    item.source.tags = resultTags;
                    return item.source;
                });

                def.resolve(res);
            });

    } catch(err) {
        LOGGER.error(err.message);
        def.reject(err);
    } finally {
        return def.promise;
    }
};

module.exports = execute;
