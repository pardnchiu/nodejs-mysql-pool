'use strict';

const MySQLPool = require('./dist/MySQLPool.js');
const MongoPool = require('./dist/MongoPool.js');
const Redis = require('./dist/Redis.js');
const Mailer = require('./dist/Mailer.js');
const CheckType = require('./dist/CheckType.js');

const MySQLPoolExport = MySQLPool.default || MySQLPool;
const MongoPoolExport = MongoPool.default || MongoPool;
const RedisExport = Redis.default || Redis;
const MailerExport = Mailer.default || Mailer;
const CheckTypeExport = CheckType.default || CheckType;

module.exports = {
  MySQLPool: MySQLPoolExport,
  MongoPool: MongoPoolExport,
  ...RedisExport,
  Mailer: MailerExport,
  CheckType: CheckTypeExport,
};

module.exports.default = module.exports;