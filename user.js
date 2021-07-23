const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const md5sum = crypto.createHash('md5');

var connection =require('./database');

app.get('/user',(req, res) => {
  //render file user.hbs
	if (req.session.loggedin) {
		let sql = "SELECT * FROM user WHERE hapus='T'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;
				res.render('user',{
					results: results, namauser: req.session.namauser
				});
		});		
		//res.render('pelanggan',{ employees: res});
	}else{
		res.redirect('/');
	}
}); 

app.post('/user-api',(req, res) => {
  let hasil=[];
  let sql = "SELECT * FROM user WHERE hapus='T'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
    //res.send(JSON.stringify({"data": results}));
	for (let i = 0; i < results.length; i++) {
		aksi1= '<a href="javascript:void(0);" class="btn btn-sm btn-info edit"'+
				'data-id_user        ="'+results[i].id_user+
				'" data-nama_lengkap ="'+results[i].nama_lengkap+ 
				'" data-email        ="'+results[i].email+
				'" data-username     ="'+results[i].username+
				'" data-level        ="'+results[i].level+
				'">Edit</a>'
        aksi2= '<a href="javascript:void(0);" class="btn btn-sm btn-danger delete"'+
			   'data-id_type_mesin="'+results[i].id_user+'">Delete</a>'
		hasil[i]= [results[i].nama_lengkap,
				 results[i].email,
				 results[i].username,
				 results[i].level,
				 aksi1+aksi2];
	}
	res.send(JSON.stringify({"data": hasil}));
  });
});

app.post('/user-add',(req, res) => {
	if (req.session.loggedin) {
		var password = crypto.createHash('md5').update("123456").digest('hex');
		let sql = "INSERT INTO user SET "+
				  "nama_lengkap ='"+req.body.nama_lengkap+"', "+
				  "email        ='"+req.body.email+"', "+
				  "username     ='"+req.body.username+"', "+
				  "password     ='"+password+"', "+
				  "lokasi       ='"+1+"', "+
				  "level        ='"+req.body.level+"'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;			
				res.redirect('/user');
		});		
	}else{
		res.redirect('/');
	}
}); 

app.post('/user-update',(req, res) => {
	if (req.session.loggedin) {
		let sql = "UPDATE user SET "+
				  "nama_lengkap ='"+req.body.nama_lengkap+"', "+
				  "email        ='"+req.body.email+"', "+
				  "username     ='"+req.body.username+"', "+
				  "level        ='"+req.body.level+"' "+
				  "WHERE id_user='"+req.body.id_user+"'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;			
				res.redirect('/user');
		});		
	}else{
		res.redirect('/');
	}
}); 

//route for delete data
app.post('/user-delete',(req, res) => {
	console.log(req.body.id_user);
  let sql = "UPDATE user SET hapus='Y' WHERE id_user='"+req.body.id_user+"'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/user');
  });
});
module.exports = app;