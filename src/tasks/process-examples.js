'use strict';

var fs = require('fs'),
    zlib = require('zlib'),
    path = require('path'),
    util = require('util'),

    vow = require('vow'),
    vowFs = require('vow-fs'),
    glob = require('glob'),

    storage = require('../cocaine/api'),
    config = require('../config'),
    logger = require('../logger'),
    constants = require('../constants');

/**
 * Read file names in given directory recursively
 * @param {String} baseDir - path to base directory
 * @returns {*}
 */
function readFiles(baseDir) {
    var def = vow.defer();
    glob("**", { cwd: baseDir, nodir: true }, function (err, files) {
        err ? def.reject(err) : def.resolve(files);
    });
    return def.promise();
}

/**
 * Compress given file
 * @param {Target} target - target object
 * @param {String} filePath - path to source file
 * @returns {*}
 */
function zipFile(target, filePath) {
    var basePath = target.getTempPath(),
        sPath = path.join(basePath, filePath),
        dPath = sPath + '.zip';

    return vowFs.isSymLink(sPath)
        .then(function (isSymlink) {
            if(isSymlink) {
                console.log('find symlink %s', filePath);
                return vow.resolve();
            }

            var def = vow.defer(),
                readStream = fs.createReadStream(sPath),
                writeStream = fs.createWriteStream(dPath);

            readStream
                .pipe(zlib.Gzip())
                .pipe(writeStream)
                .on('error', function (err) {
                    logger.warn(util.format('error occur while compressing: %s', filePath), module);
                    def.reject(err);
                })
                .on('close', function () {
                    logger.verbose(util.format('compressed file: %s', filePath), module);
                    fs.rename(dPath, sPath, function (err) {
                        err ? def.reject(err) : def.resolve(filePath);
                    });
                });

            return def.promise();
    });
}

function sendToStorage(target, filePath) {
    var basePath = target.getTempPath(),
        fPath = path.join(basePath, filePath),
        key = util.format('%s/%s/%s', target.getSourceName(), target.ref, filePath);

    return vowFs.isSymLink(fPath)
        .then(function (isSymlink) {
            if(isSymlink) {
                console.log('find symlink %s', filePath);
                return vow.resolve();
            }

            return vowFs.read(fPath).then(function(content) {
                return storage.write(key, content);
            });
        });
}

/**
 * Executes copying built folders from content to temp
 * @param {Target} target for building
 * @returns {defer.promise|*}
 */
module.exports = function (target) {
    var openFilesLimit = config.get('maxOpenFiles') || constants.MAXIMUM_OPEN_FILES;

    return storage.init()
        .then(function() {
            return readFiles(target.getTempPath());
        })
        .then(function (files) {
            var chuncks = files.reduce((function (n) {
                    return function(p, c, i) {
                        (p[i/n|0] = p[i/n|0] || []).push(c);
                        return p;
                    };
                })(openFilesLimit), []);

            logger.debug(util.format('example files count: %s', files.length), module);
            logger.debug(util.format('compression will be executed in %s steps', chuncks.length), module);

            return chuncks.reduce(function (prev, item, index) {
                prev = prev.then(function () {
                    logger.debug(util.format('compress and send files in range %s - %s',
                        index * openFilesLimit, (index + 1) * openFilesLimit), module);
                    return vow.all(item.map(function (item) {
                        return zipFile(target, item).then(function() {
                            //return target.isDryRun ? vow.resolve() : sendToStorage(target, item);
                            return sendToStorage(target, item);
                        });
                    }));
                });
                return prev;
            }, vow.resolve());
        });
};