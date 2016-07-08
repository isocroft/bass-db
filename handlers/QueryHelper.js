//var utils = require("util");
var q = require('q');

var quote = function(val, link){

   val = val.replace(/'|"/g, "");
   var type = typeof val;
   
   if(type == "string")
     return (link && link == " LIKE ")? "'%" + val + "%'"  : "'" + val + "'";
   else if(type == "number")
     return val;
   else if(type == "boolean")
     return (type ? 1 : 0);
   else
     return "'" + val.toString() + "'"; 

},

normalizeData = function(link, data, connection){

    var dataType = ({}).toString.call(data).split(" ")[1].slice(0, -1).toLowerCase(),
	    conjunction = null,
		regex = null,
        str = "",
		_temp,
        check;

    switch(this.queryType){
       case "SELECT":
         conjunction = " AND ";
         str += " WHERE ";
         if(link == ""){
            link = " = ";
         }
         if(link == "LIKE"){
            link = " LIKE ";
         }
       break;
       case "UPDATE":
         conjunction = " , ";
         str += " SET ";
         link = " = ";
       break;
       case "INSERT":
         conjunction = " , ";
         str +=  " VALUES (";
       break;
    }

    check = str.indexOf("(") > 0;
	regex = new RegExp(conjunction+"$", "i");

    if(dataType == "object"){
        for(var g in data){
		 if(data.hasOwnProperty(g)){ 
		     if(check)
			     str += link + quote(connection.escape(data[g])) + conjunction // INSERT
			 else
				 str += g + link + quote(connection.escape(data[g]), link) + conjunction; // SELECT
		  }	  
        }
    }else if(dataType == "array"){
       // @TODO: for insert/delete queries;
	   for(var t=0; t < data.length; t++){
	       _temp = data[t];
		   link = t > 0? "(" : "";
		   for(var g in _temp){
			    if(_temp.hasOwnProperty(g)){
				    if(check)
				       str += link + quote(connection.escape(_temp[g])) + conjunction
			    } 
		   }
		   str = str.replace(regex, ")" + conjunction);
       }		   
    }

    str = str.replace(regex, (check ? (dataType == "array"? "" : ")") : ""));

    return str;
}

function QueryHelper(manager){

   this.manager = manager;

   return this;

}


QueryHelper.prototype.composeQuery = function(link, data, connection){

      var normalized = "", query = this.manager.queryType;

      switch(this.manager.queryType){
         case "SELECT":
            query += " " + this.manager.queryColumns + " FROM " + this.manager.queryTable;
         break;
         case "INSERT":
            query += " INTO " + this.manager.queryTable + " (" + this.manager.queryColumns + ")";
         break;
         case "UPDATE":
            query += " " + this.manager.queryTable;
         break;
      }
	  
      if(data){ 
          normalized = normalizeData.call(this.manager, link, data, connection);
      }
     
	  this.sqlQuery = query + normalized;
      
      return this;
  
} 

QueryHelper.prototype.isEmpty = function(obj){
    for(var y in obj){
	    return false;
	}
	return true;
}

QueryHelper.prototype.adjoin = function(boundaries, connection){

     var val, line = "", conjunction = " AND ";

      try{
           if(boundaries instanceof Object){ // {"xxxxx":[">=", 5600],"xxxxxx":["<=", 12000]} 
		       if(this.isEmpty(boundaries)){
			       throw "empty";
			   }
               for(var f in boundaries){
                   if(boundaries.hasOwnProperty(f)){
                       val = boundaries[f];
                       if(Array.isArray(val) && val.length == 2){
                           if(val[0].match(/(?:>|<)?\=/)){
                              line += conjunction + val + val[0] + quote(connection.escape(val[1]));
                           }else{
                              if(line.indexOf("BETWEEN") == -1){
                                line += conjunction + val + " BETWEEN "; 
                                line += quote(connection.escape(val[0])) + conjunction + quote(connection.escape(val[1]));
                              }  
                           }
                       }else{
                          // err
                          throw "invalid";
                       }
                   }
               }
			   
			   this.sqlQuery += (this.sqlQuery.indexOf("WHERE") > -1 ? line : line.replace(conjunction, " WHERE "));
            } 
     
      }catch(ex){ 
          ; // we are simply using the error (thrown above) to alter the flow of control and not to indicate an error condition. 
      }finally{

          if(this.manager.orderClause){
                if(this.manager.queryType == "SELECT"){
                     this.sqlQuery += " ORDER BY " + this.manager.orderClause;
                }
          }
      }      

      return this;
}      

QueryHelper.prototype.execute = function(connection){

      var _self = this, deferred = q.defer();
      console.log('==== '+_self.sqlQuery);
	  connection.query(_self.sqlQuery, function(err, rows, fields){
		   _self.manager.reset(fields);
		   if(err){
			   return deferred.reject(err);
		   }
		   deferred.resolve(rows);
      });
      return deferred.promise;
}

module.exports = QueryHelper;
