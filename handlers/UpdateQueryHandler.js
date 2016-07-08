var QueryHelper = require("./QueryHelper.js");
var q = require('q');

function UpdateQueryHandler (that){
	
	this.sqlQuery = "";

	QueryHelper.call(this, that);

	return this;
}

UpdateQueryHandler.prototype = Object.create(QueryHelper.prototype, {});
UpdateQueryHandler.prototype.constructor = UpdateQueryHandler;

UpdateQueryHandler.prototype.replaceAll = function(set_props){
      var _self = this;
	  
	  return this.manager.getConnection().then(function(conn){
	      return _self.composeQuery("", set_props, conn).execute(conn);
	  });
}

UpdateQueryHandler.prototype.replaceAllWhere = function(set_props, attrib_props){
	  var _self = this;
	  
	  return this.manager.getConnection().then(function(conn){
	      return _self.composeQuery("", set_props, conn).adjoin(attrib_props, conn).execute(conn);
	  });
}

module.exports = UpdateQueryHandler;