var QueryHelper = require("./QueryHelper.js");

function SelectQueryHandler (that){
	
	this.sqlQuery = "";

	QueryHelper.call(this, that);

	return this;
}

SelectQueryHandler.prototype = Object.create(QueryHelper.prototype, {});
SelectQueryHandler.prototype.constructor = SelectQueryHandler;

SelectQueryHandler.prototype.findAll = function(){
      var _self = this;
	  
	  return this.manager.getConnection().then(function(conn){
	      return _self.composeQuery("", null, conn).execute(conn);
	  });
}

SelectQueryHandler.prototype.findAllWhere = function(clause_props, boundary_props){
	  var _self = this;
	  
	  return this.manager.getConnection().then(function(conn){
		     return _self.composeQuery("", clause_props, conn).adjoin(boundary_props, conn).execute(conn);
	  });	
}

SelectQueryHandler.prototype.findAllWhereLike = function(clause_props, boundary_props){
	var _self = this;
	  
	return this.manager.getConnection().then(function(conn){  
	    return _self.composeQuery("LIKE", clause_props, conn).adjoin(boundary_props, conn).execute(conn);
	}); 
}

module.exports = SelectQueryHandler;
