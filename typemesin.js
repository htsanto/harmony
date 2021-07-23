const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const app = express();

var connection =require('./database');

app.get('/typemesin',(req, res) => {
  //render file typemesin.hbs
	if (req.session.loggedin) {
		let sql = "SELECT * FROM tbltypemesin WHERE hapus='T'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;
				res.render('typemesin',{
					results: results, namauser: req.session.namauser
				});
		});		
		//res.render('pelanggan',{ employees: res});
	}else{
		res.redirect('/');
	}
}); 

app.post('/typemesin-api',(req, res) => {
  let hasil=[];
  let sql = "SELECT * FROM tbltypemesin WHERE hapus='T'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
    //res.send(JSON.stringify({"data": results}));
	for (let i = 0; i < results.length; i++) {
		aksi1= '<a href="javascript:void(0);" class="btn btn-sm btn-info edit"'+
				'data-id_type_mesin   ="'+results[i].id_type_mesin+
				'" data-type_mesin    ="'+results[i].type_mesin+ 
				'" data-jenis_mesin   ="'+results[i].jenis_mesin+
				'" data-merek_mesin   ="'+results[i].merek_mesin+
				'">Edit</a>'
        aksi2= '<a href="javascript:void(0);" class="btn btn-sm btn-danger delete"'+
			   'data-id_type_mesin="'+results[i].id_type_mesin+'">Delete</a>'
		hasil[i]= [results[i].type_mesin,
		         results[i].jenis_mesin,
				 results[i].merek_mesin,
				 aksi1+aksi2];
	}
	res.send(JSON.stringify({"data": hasil}));
  });
});

app.post('/typemesin-add',(req, res) => {
	if (req.session.loggedin) {
		let sql = "INSERT INTO tbltypemesin SET "+
				  "type_mesin  ='"+req.body.type_mesin+"', "+
				  "jenis_mesin ='"+req.body.jenis_mesin+"', "+
				  "merek_mesin ='"+req.body.merek_mesin+"'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;			
				res.redirect('/typemesin');
		});		
	}else{
		res.redirect('/');
	}
}); 

app.post('/typemesin-update',(req, res) => {
	if (req.session.loggedin) {
		let sql = "UPDATE tbltypemesin SET "+
				  "type_mesin  ='"+req.body.type_mesin+"', "+
				  "jenis_mesin ='"+req.body.jenis_mesin+"', "+
				  "merek_mesin ='"+req.body.merek_mesin+"' "+
				  "WHERE id_type_mesin='"+req.body.id_type_mesin+"'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;			
				res.redirect('/typemesin');
		});		
	}else{
		res.redirect('/');
	}
}); 

//route for delete data
app.post('/typemesin-delete',(req, res) => {
	console.log(req.body.id_type_mesin);
  let sql = "UPDATE tbltypemesin SET hapus='Y' WHERE id_type_mesin='"+req.body.id_type_mesin+"'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/typemesin');
  });
});
module.exports = app;