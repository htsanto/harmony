const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const app = express();

var cors = require('cors');
var connection =require('./database');

app.use(cors());

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

app.get('/customers',(req, res) => {
  //render file customers.hbs
	if (req.session.loggedin) {
		let sql = "SELECT * FROM tblpelanggan WHERE hapus='T'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;
				res.render('customers',{
					results: results, namauser: req.session.namauser
				});
		});		
		//res.render('pelanggan',{ employees: res});
	}else{
		res.redirect('/');
	}
}); 

//tampilkan semua data product
app.post('/customers-api',(req, res) => {
  let hasil=[];
  let sql = "SELECT * FROM tblpelanggan WHERE hapus='T'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
    //res.send(JSON.stringify({"data": results}));
	for (let i = 0; i < results.length; i++) {
		aksi1= '<a href="javascript:void(0);" class="btn btn-sm btn-info edit"'+
				'data-id_pelanggan="'+results[i].id_pelanggan+
				'" data-nama_pelanggan="'+results[i].nama_pelanggan+ 
				'" data-alamat="'+results[i].alamat+
				'" data-no_telephon="'+results[i].no_telephon+
				'" data-no_hp="'+results[i].no_hp+
				'" data-contact_person="'+results[i].contact_person+
				'">Edit</a>'
        aksi2= '<a href="javascript:void(0);" class="btn btn-sm btn-danger delete"'+
			   'data-id_pelanggan="'+results[i].id_pelanggan+'">Delete</a>'
		hasil[i]= [results[i].nama_pelanggan,
		         results[i].alamat,
				 results[i].no_telephon,
				 results[i].no_hp,
				 results[i].contact_person,
				 aksi1+aksi2];
	}
	res.send(JSON.stringify({"data": hasil}));
  });
});

app.post('/customers-add',(req, res) => {
	if (req.session.loggedin) {
		let sql = "INSERT INTO tblpelanggan SET "+
				  "nama_pelanggan='"+req.body.nama_pelanggan+"', "+
				  "alamat='"+req.body.alamat+"', "+
				  "no_telephon='"+req.body.no_telephon+"', "+
				  "no_hp='"+req.body.no_hp+"', "+
				  "contact_person='"+req.body.contact_person+"', "+
				  "hapus='T'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;			
				res.redirect('/customers');
		});		
	}else{
		res.redirect('/');
	}
}); 

app.post('/customers-update',(req, res) => {
	if (req.session.loggedin) {
		let sql = "UPDATE tblpelanggan SET "+
				  "nama_pelanggan    ='"+req.body.nama_pelanggan+"', "+
				  "alamat            ='"+req.body.alamat+"', "+
				  "no_telephon       ='"+req.body.no_telephon+"', "+
				  "no_hp             ='"+req.body.no_hp+"', "+
				  "contact_person    ='"+req.body.contact_person+"' "+
				  "WHERE id_pelanggan='"+req.body.id_pelanggan+"'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;	
				res.redirect('/customers');
		});		
	}else{
		res.redirect('/');
	}
}); 

//route for delete data
app.post('/customers-delete',(req, res) => {
  let sql = "UPDATE tblpelanggan SET hapus='Y' WHERE id_pelanggan='"+req.body.id_pelanggan+"'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/customers');
  });
});
module.exports = app;