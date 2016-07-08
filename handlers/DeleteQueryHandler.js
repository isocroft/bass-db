var QueryHelper = require("./QueryHelper.js");

function DeleteQueryHandler (that){
	
	this.sqlQuery = "";

	QueryHelper.call(this, that);

	return this;
}

DeleteQueryHandler.prototype = Object.create(QueryHelper.prototype, {});
DeleteQueryHandler.prototype.constructor = DeleteQueryHandler;

DeleteQueryHandler.prototype.applyAll = function(){

}


module.exports = DeleteQueryHandler;