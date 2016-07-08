/*
  This is a simple query builder MySQL for NodeJS 
  @author: Ifeora Okechukwu
  @created_at: 30/05/2016
  @updated_at: 08/07/2106
 */
 
 
var mysql = require('mysql'); // get DB Driver
var q = require('q');

var UpdateQueryHandler = require("./handlers/UpdateQueryHandler.js");
var SelectQueryHandler = require("./handlers/SelectQueryHandler.js");
var InsertQueryHandler = require("./handlers/InsertQueryHandler.js");
var DeleteQueryHandler = require("./handlers/DeleteQueryHandler.js");

var SQLTable = require("./builder/SQLTable.js");

function DBManager(settings_obj){
	
	var settings_obj = settings_obj;
	var connection_obj = null;
	var handler = null;
	
	settings_obj['charset'] = 'utf8';
	//settings_obj['idle'] = 10000;
	//settings_obj['refresh'] = 5000;

	this.getSettings = function(){

	    return settings_obj;

	};    

	this.pool = mysql.createPool( /* MySQL 5.2+ */
            this.getSettings()
    );

	this.getConnection = function(){
          
         var deferred = q.defer();
         
         if(connection_obj !== null){
             process.nextTick(function(){
                 deferred.resolve(connection_obj);
             });
			 return deferred.promise;
         }  

         this.pool.on('connection', function(connection){
              console.log('----------------- db connection :ok');
              connection_obj = connection;
         });

         this.pool.on('enqueue', function(){
             console.log('----------------- db enqueue ');
         });

         this.pool.on('error', function(){
             console.log('-------------- db error');
         });

         this.pool.getConnection(function(err, connection){
            if(err) {
                console.log('Database is not connected!');
                return deferred.reject(err);
            } 

            deferred.resolve(connection);
         });

         return deferred.promise;
    };
 

	this.setSettings = function(new_settings_obj){

        settings_obj = new_settings_obj;

	};

	this.provideHandler = function(key){
       
       switch(key){
	         case 1:
	           handler = new UpdateQueryHandler(this);
	         break;  
	         case 2:
	           handler = new SelectQueryHandler(this);
	         break;  
	         case 3:
	           handler = new InsertQueryHandler(this);
	         break; 
             case 4:
	           handler = new DeleteQueryHandler(this);
	         break; 			 
       }

       return handler;
	}

    this.errorMsg1 = "Error: DB table not provided";
	this.errorMsg2 = "Error: DB query type not provided";

	this.queryType = null;
	this.queryTable = null;
	this.queryColumns = null;
	this.queryModifier = null;
	this.orderClause = null;
	this.queryDB = settings_obj['database'];

	this.reset = function(){
		this.queryType = null;
		this.queryTable = null;
		this.queryColumns = null;
		this.queryModifier = null;
		this.orderClause = null;
	}
	
	this.yield = function(){
	
		this.reset();
		
		handler = null;
		
		if(connection_obj){
		     connection_obj.release();
			 connection_obj = null;
		}
    };

	return this;

};

DBManager.UPDATE_HANDLER = 1;
DBManager.SELECT_HANDLER = 2;
DBManager.INSERT_HANDLER = 3;
DBManager.DELETE_HANDLER = 4;

DBManager.prototype.pick = function(table){
   this.queryTable = (table && typeof table === "string")? table : null;
   return this;
}

DBManager.prototype.destroy = function(){
    if(this.queryDB){
		this.queryType = " DROP DATABASE ";
		// @TODO:
	}	
}

DBManager.prototype.get = function(columns){
    if(this.queryTable){
		this.queryType = "SELECT";
		this.queryColumns = (columns && columns instanceof Array) ? columns.join(", ") : "*";
		return this.provideHandler(DBManager.SELECT_HANDLER);
	}
	throw new Error(this.errorMsg1);	
}

DBManager.prototype.set = function(columns){
    if(this.queryTable){
		this.queryType = "INSERT";
		this.queryColumns = (columns && columns instanceof Array) ? columns.join(", ") : "*";
		return this.provideHandler(DBManager.INSERT_HANDLER);
	}
	throw new Error(this.errorMsg1);	
}

DBManager.prototype.let = function(columns){
    if(this.queryTable){
		this.queryType = "UPDATE";
		this.queryColumns = (columns && columns instanceof Array) ? columns.join(", ") : "*";
		return this.provideHandler(DBManager.UPDATE_HANDLER);
	}
	throw new Error(this.errorMsg1);	
}

DBManager.prototype.orderBy = function(column, ascending){
   if(this.queryDB){
      if(this.orderClause === null){
          this.orderClause = column + (ascending? " ASC " :" DESC ");
      }
	  return this;
   }
   throw new Error(this.errorMsg2);
}

DBManager.prototype.det = function(columns){
   if(this.queryTable){
      this.queryType = "DELETE";
	  this.queryColumns = (columns && columns instanceof Array) ? columns.join(", ") : "*";
	  return this.provideHandler(DBManager.DELETE_HANDLER);
   }
   throw new Error(this.errorMsg1);
}

DBManager.prototype.schema = (function(mgr, table){
    var __self = mgr.prototype;
	
	return {
		build:function(){

		    return new table();
		},
		unbuild:function(){
		
		}
     } 
}(DBManager, SQLTable));

module.exports = DBManager;