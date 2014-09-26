'use strict';

var path = require('path'),

    constants = require('./constants'),
    Target = require('./target'),

    TargetPublish  = function (source, ref) {
        this.init(source, ref, null);
        this.declaration.tasks = [
            require('./tasks/collect-sets'),
            require('./tasks/remove-temp'),
            require('./tasks/create-temp'),
            require('./tasks/copy-to-temp'),
            require('./tasks/archive')
        ];
        return this;
    };

TargetPublish.prototype = Target.prototype;

/**
 * Sets options to to target
 * @param {Object} options
 */
TargetPublish.prototype.setOptions = function(options) {
    this.options = options;
};

/**
 * Set isDryRun option
 * @param {Boolean} isDryRun
 */
TargetPublish.prototype.setDryRun = function(isDryRun) {
    this.isDryRun = isDryRun || false;
};

/**
 * Check is publish command was run in dry run mode without tarball send
 * @returns {Function}
 */
TargetPublish.prototype.isDryRun = function() {
    return this.isDryRun;
};

/**
 * Returns content path for target
 * @returns {String}
 */
TargetPublish.prototype.getContentPath = function () {
    return process.cwd();
};

/**
 * Returns output path for target
 * @returns {String}
 */
TargetPublish.prototype.getOutputPath = function () {
    return process.cwd();
};

/**
 * Returns output path for target
 * @returns {String}
 */
TargetPublish.prototype.getTempPath = function () {
    return path.join(process.cwd(), constants.DIRECTORY.TEMP);
};

module.exports = TargetPublish;
