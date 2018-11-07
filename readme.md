# PostgreSQL, Node backend-stack setup and demo



## Step A: Installing PostgreSQL and creating a database

1. Download for windows from https://www.enterprisedb.com/downloads/postgres-postgresql-downloads. If you use linux, you're on your own >:)

2. Run the installer, and remember the root password and the port

   ```password: root, port: 5432```

3. Finish installation. Be sure to have selected all options (including cli tools)

4. Add the cli-tool's path to system variables: ```C:\Program Files\PostgreSQL\11\bin```

5. Now to sign in as the default user, run ```psql -U postgres -h localhost``` . ```postgres``` is the default user that has the password we set prior, `root` in this case.

6. To create a database, enter `create database university. In our case, we named the database `university`

7. Create a user with the command `create user sunny with password 'pass';`

8. To enter the newly created database, enter `\c university`

9. Create a new schema: `create schema coursesInfo`

10. Create a table with standard syntax:

    > create table coursesInfo.course (
    > cFaculty VARCHAR(4) NOT NULL,
    > cId integer NOT NULL,
    > title VARCHAR(32) NOT NULL,
    > PRIMARY KEY (cFaculty, cId));

11. I used the following insert statements to insert some tuples we can work with:

    > insert into coursesInfo.course values ('SOFE', 1010, 'Introduction to Programming');
    >
    > insert into coursesInfo.course values ('SOFE', 2010, 'Object Oriented Programming');
    >
    > insert into coursesInfo.course values ('MATH', 1010, 'Calculus I');
    >
    > insert into coursesInfo.course values ('PSYC', 2010, 'Abnormal Psychology');

12. To verify entries, you can run `select * from coursesInfo.course;` Result should be similar to: 

    ` cfaculty | cid  |            title
    ----------+------+-----------------------------
     SOFE     | 1010 | Introduction to Programming
     SOFE     | 2010 | Object Oriented Programming
     MATH     | 1010 | Calculus I
     PSYC     | 2010 | Abnormal Psychology
    (4 rows)`

13. I used the following entries to create 2 other tables with foreign keys

    > create table coursesInfo.session (
    >
    > cFaculty VARCHAR(4) NOT NULL,
    >
    > cId integer NOT NULL,
    >
    > sectionNum integer NOT NULL,
    >
    > semester VARCHAR(10) NOT NULL,
    >
    > instructor VARCHAR(32) NOT NULL,
    >
    > PRIMARY KEY (cFaculty, cId, sectionNum, semester),
    >
    > FOREIGN KEY (cFaculty, cId) REFERENCES coursesInfo.course(cFaculty, cId)
    >
    > );

    > insert into coursesInfo.session values ('SOFE', 1010, 1, 'fall2018', 'Khalid Hafeez');
    >
    > insert into coursesInfo.session values ('SOFE', 1010, 2, 'fall2018', 'Anwar Abdulbari');
    >
    > insert into coursesInfo.session values ('PSYC', 1010, 1, 'winter2018', 'Shannon Vetter');
    >
    > insert into coursesInfo.session values ('SOFE', 2010, 5, 'winter2019', 'Some Prof');
    >
    > insert into coursesInfo.session values ('MATH', 1010, 1, 'fall2018', 'Ilona Kletskin');
    >
    > insert into coursesInfo.session values ('MATH', 1010, 2, 'fall2018', 'Paula Dicato');
    >
    > insert into coursesInfo.session values ('MATH', 1010, 1, 'fall2017', 'Ming Ding');

    > create table coursesInfo.prereq (
    >
    > targetFaculty VARCHAR(4) NOT NULL,
    >
    > targetId integer NOT NULL,
    >
    > prereqFaculty VARCHAR(4) NOT NULL,
    >
    > prereqId integer NOT NULL,
    >
    > FOREIGN KEY (targetFaculty, targetId) REFERENCES coursesInfo.course(cFaculty, cId),
    >
    > FOREIGN KEY (prereqFaculty, prereqId) REFERENCES coursesInfo.course(cFaculty, cId)
    >
    > );

    > insert into coursesInfo.prereq values ('SOFE', 2010, 'SOFE', 1010);

14. Now we can say we have finished setting up a trivial database. We can now implement the API logic



## Step B: Setting up a simple API using node.js

#### Overview:

Our API will work using parametrized URLS, such as `mynodeapp.com/courses?dept=sofe`. This should query a pre-defined **Canned Transaction** 

Note the asynchronous nature of JavaScript (if statement C follows statement B, it will not wait for B to finish running). This is why we have callbacks (promises or callback functions).

Here, we build a basic node app. where we use node-postgres and express.

1. After installing node.js, open a blank directory and run `npm install pg` and `npm install express`

2. At the top, we have our "imports". We can import modules, and assign them to variables. Add the following lines:

   > const express = require('express');
   >
   > const app = express();
   >
   > var pg = require('pg');
   >
   > var conString = "postgres://postgres:root@localhost:5432/university"; //Can be found in the Details page
   > var client = new pg.Client(conString);

   The format of the connection string follows `postgres://user:pass@domain/dbname`. 

   `var client = new pg.Client(conString);` prepares a client for connection

   `const app = express()` instantiates an express app, which can listen on a server that we set up

3. Now we can connect to the client, and have an error function in the case that it does not work. This will be in the form of a callback function (i.e. the contents only run once connection is established).

   > client.connect(function(err) {
   > ​	if(err) {
   > ​		return console.log('could not connect to postgres', err);
   > ​	}
   >
   > //The url selection logic goes here
   >
   > }

4. We can now use the `app` variable we defined prior to listen on the local server for specific urls. The syntax follows a callback function as below:

    `app.get('/url1/url2/', (req, res) => { // code here })` The `req` contains the url, query strings, and parameters as required. 

   For example, if we set the URL string to `/url/:id` and we needed to access id, we can use `req.params.id`

   If we have a query string for url `/url/idNum/?name=Sunny&awesome=True` then `req.query` will contain the following object: 	`{ name: 'Sunny', awesome: 'True' } `

   To send to the webpage (in any format), we can simply use `res.send("string to write")`

   For our purposes, we have the following statements. Throw these inside the prior connect() callback so we have this:

   > client.connect(function(err) {
   > ​	if(err) {
   > ​		return console.log('could not connect to postgres', err);
   > ​	}
   > ​	app.get('/', (req, res) => {
   > ​		res.send('Improper use of API. Please refer to the API Reference Manual');
   > ​	});
   >
   > 	app.get('/api/courses', (req, res) => {
   > 		res.send([1,2,3]);
   > 	});
   > 	
   > 	app.get('/api/sessions', (req, res) => {
   > 		const queryParams = req.query;
   > 		if (Object.keys(req.query).length === 0) {
   > 			res.send("No Query Params");
   > 		}
   > 		else {
   > 			getSessions(req.query, res);
   > 		}
   > 	});
   > 	
   > 	app.get("/api/getPrereqs/:faculty/:id", (req, res) => {
   > 		getPrereqs(req.params.faculty, req.params.id, res);
   > 	});
   > })

   Now we run the queries through functions `getSessions` and `getPrereqs` . They each have a `res` parameter, as the only reliable way to write to the page is AFTER they are done querying (asynchronicity)



   An example of the getPrereqs function by faculty and id is shown below:

   ```javascript
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
   ```

   And this writes to the page
