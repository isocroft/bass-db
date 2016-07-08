# bass-db

A simple query builder for NodeJS applications using a MySQL backend

## Installation

```bash
$ npm install bass-db
```  

## Usage

Firstly, you need to go into the package itself (after installation) and setup your DB details in the **settings.json** file. 
Thereafter, move into your project and start coding like so:

```js

'use strict'; 

var db = require('bass-db');

/* SINGLE QUERY EXAMPLE */

	    db // SELECT query
	    .pick("{table0}") // table name
	    .get([
		   "*" // table column name(s)
	    ])
	    .findAll()
	    .then(function(results){
		    console.log(results);
		    db.yield();
	    });
	  
	    db  // DELETE query
	    .pick("{table0}")
	    .det([
		    "{column1}",
		    "{column2}"
	    ])
	    .applyAll()
	    .then(function(results){
		    console.log(results);
		    db.yield(); // close the connection
	    });
  
 /* MULTIPLE QUERY EXAMPLE */
                
		db // SELECT query
		.pick("{table1}")
		.get([
		   "{column1}",
		   "{coulmn2}",
		   "{coulmn3}"
		])
		.findAllWhere({
			"{column2}":"{value2}"
		})
		.then(function(data){
			return db // INSERT query
			.pick("{table2}")
			.set([
			   "{column1}",
			   "{column2}"
			])
			.applyAll({
			   "{column1}":"{data[0].value1}",
			   "{column2}":"{data[0].value2}"
			});
		}, console.error)
		.then(function(data){
			return  db // UPDATE query
			.pick("{table3}")
			.let([ 
			   "{column1}",
			   "{column2}"
			])
			.replaceAllWhere({}, {
			   "{column1}":["=", "{value1}"],
			   "{column2}":[">=", {value2}] // numeric data type
			});
		}, console.error)
		.then(function(data){
			console.log(data);
			db.yield();
		},
		console.error); 	
```

## Tests


## License

  MIT LICENSE
