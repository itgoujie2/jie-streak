var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require(__dirname + '/config/config');
var fs = require('fs');
var multer = require('multer');
var flash = require('connect-flash');
// var session = require('express-session');
var port = process.env.PORT || config.get('port');

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
//app.use(session({secret : 'jie'}));
app.use(bodyParser.json());
app.use(flash());
app.use(multer({dest : './uploads/'}));

var csv = [];

app.post('/upload', function(req, res){
	
	
	fs.readFile(req.files.csv.path, function(err, data){
		
		csv = data.toString();

	});

});

app.get('/search', function(req, res){

	var company = req.query['company'];

	var contactedMost = findMost(company, csv);
	var result = constructList(company, contactedMost, csv);

	res.render('show', {result : result});	
});

app.get('/', function(req, res){
	res.render('index');
});



app.listen(port);

//utility method to find subarray in JS
Array.prototype.subarray=function(start,end){
     if(!end){ end=-1;} 
    return this.slice(start, this.length+1-(end*-1));
}

//user typed in company1, search which companies was
//contacted by company1 most
function findMost(company, raw){

	//devide raw data by row
	var row = [];
	if (csv.length != 0){
		row = csv.split('\n');
	}

	//dict to track how many times the company was contacted
	var dict = {};
	for (i=0; i<row.length; i++){

		//devide row by column
		var column = row[i].split(',');
		//we only need to search the email array of receiver
		var companies = column.subarray(1, -4);
		//extract company name from email
		var sender = GetEmailParts(column[0]).domain;

		//if the sender is not the company user typed in, we dont need to search
		if (sender != company) continue;

		//start search
		for (j=0; j<companies.length; j++){
			var tempCompany = GetEmailParts(companies[j].replace('"', '')).domain;
			if (!dict[tempCompany]) dict[tempCompany] = 1;
			else dict[tempCompany]++;
		}
	}

	return findMax(dict);

}

function GetEmailParts( strEmail ){

    // Set up a default structure with null values 
    // incase our email matching fails.
    var objParts = {
        user: null,
        domain: null,
        ext: null
        };
    
    // Get the parts of the email address by leveraging
    // the String::replace method. Notice that we are 
    // matching on the whole string using ^...$ notation.
    strEmail.replace( 
        new RegExp( "^(.+)@(.+)\\.(\\w+)$" , "i" ), 
        
        // Send the match to the sub-function.
        function( $0, $1, $2, $3 ){
            objParts.user = $1;
            objParts.domain = $2;
            objParts.ext = $3;
        }
        );
    
    // Return the "potentially" updated parts structure.
    return( objParts );
}

//based on dict, find which company was contacted most
function findMax(dict){

	var max = 0;
	var result = {};
	for (key in dict){
		if (dict[key] > max){
			max = dict[key];
			result = key;
		}
	}

	return result;
}

//based on which company was contacted most, construct the table showing on the UI
function constructList(company, contactedMost, raw){

	var records = [];

	var row = [];
	if (csv.length != 0){
		row = csv.split('\n');
	}

	for (i=0; i<row.length; i++){

		var column = row[i].split(',');
		var companies = column.subarray(1, -4);
		var sender = GetEmailParts(column[0]).domain;

		console.log(companies);

		if (sender != company) continue;



		for (j=0; j<companies.length; j++){
			var tempCompany = GetEmailParts(companies[j].replace('"', '')).domain;
			console.log('inside construct tempCompany: ' + tempCompany);
			if (tempCompany == contactedMost){
				var record = {
					'sender' : column[0].toString(),
					'receiver' : companies[j].replace('"', '').toString(),
					'timestamp' : column[column.length-3],
					'subject' : column[column.length-2],
					'message_id' : column[column.length-1]
				};
				records.push(record);
			}
		}
	}

	return records;
}
