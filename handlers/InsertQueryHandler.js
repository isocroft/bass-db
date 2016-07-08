var QueryHelper = require("./QueryHelper.js");

function InsertQueryHandler (that){
	
	this.sqlQuery = "";
	
	QueryHelper.call(this, that);

	return this;
}

InsertQueryHandler.prototype = Object.create(QueryHelper.prototype, {});
InsertQueryHandler.prototype.constructor = InsertQueryHandler;

InsertQueryHandler.prototype.applyAll = function(attrib_props){
      var _self = this;
	  
	  return this.manager.getConnection().then(function(conn){
	       return _self.composeQuery("", attrib_props, conn).execute(conn);
	  });	   
}

module.exports = InsertQueryHandler;