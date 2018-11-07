const express = require('express');

const app = express();

var pg = require('pg');

var conString = "postgres://postgres:root@localhost:5432/university"; //Can be found in the Details page
var client = new pg.Client(conString);

client.connect(function(err) {
	if(err) {
		return console.log('could not connect to postgres', err);
	}
	app.get('/', (req, res) => {
		res.send('Improper use of API. Please refer to the API Reference Manual');
	});

	app.get('/api/courses', (req, res) => {
		res.send([1,2,3]);
	});

	app.get('/api/sessions', (req, res) => {
		const queryParams = req.query;
		if (Object.keys(req.query).length === 0) {
			res.send("No Query Params");
		}
		else {
			getSessions(req.query, res);
		}
	});

	app.get("/api/getPrereqs/:faculty/:id", (req, res) => {
		getPrereqs(req.params.faculty, req.params.id, res);
	});
})




function getPrereqs(faculty, id, serverRes) {
	query = "SELECT * FROM coursesInfo.prereq WHERE targetFaculty = '" + faculty + "' AND targetid = " + id + ";";

	  client.query(query, (err, res) => {
	  	if (err){
	  		console.log(err.stack)
	  	} else {
	  		console.log(res.rows)
	  		rows = res.rows;
	  		serverRes.send(rows);
	  	}
	  });
}

function getSessions(params, serverRes) {
	selectors = "";
	if (params['instructor']) {
		if (selectors == "") {
			selectors += "WHERE instructor = '" + params['instructor'] + "' ";
		} else {
			selectors += "AND instructor = '" + params['instructor'] + "' ";
		}
	}

	if (params['semester']) {
		if (selectors == "") {
			selectors += "WHERE semester = '" + params['semester'] + "' ";
		} else {
			selectors += "AND semester = '" + params['semester'] + "' ";
		}
	}

	if (params['courseId']) {
		if (selectors == "") {
			selectors += "WHERE cid = '" + params['courseId'] + "' ";
		} else {
			selectors += "AND cid = '" + params['courseId'] + "' ";
		}
	}

	if (params['faculty']) {
		if (selectors == "") {
			selectors += "WHERE cfaculty = '" + params['faculty'] + "' ";
		} else {
			selectors += "AND cfaculty = '" + params['faculty'] + "' ";
		}
	}

	selectors += ";"
	query = "SELECT * FROM coursesInfo.session " + selectors;
	console.log(query);


	  client.query(query, (err, res) => {
	  	if (err){
	  		console.log(err.stack)
	  	} else {
	  		console.log(res.rows)
	  		rows = res.rows;
	  		serverRes.send(rows);
	  	}
	  });
}
app.listen(3000);