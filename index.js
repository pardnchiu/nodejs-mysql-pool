'use strict';

const MySQLPool = require('./dist/MySQLPool.js');

const MySQLPoolExport = MySQLPool.default || MySQLPool;

module.exports = MySQLPoolExport
module.exports.default = MySQLPoolExport;