var settings = require('./settings.json');
var DBManager = require("./DBManager");


/* */

module.exports = new DBManager(
   settings
);