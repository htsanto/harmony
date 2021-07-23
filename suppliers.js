const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const app = express();

var connection =require('./database');

app.get('/suppliers',(req, res) => {
  //render file suppliers.hbs
	if (req.session.loggedin) {
		let sql = "SELECT * FROM tblsupplier WHERE hapus='T'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;
				res.render('suppliers',{
					results: results, namauser: req.session.namauser
				});
		});		
		//res.render('pelanggan',{ employees: res});
	}else{
		res.redirect('/');
	}
}); 

app.post('/suppliers-api',(req, res) => {
  let hasil=[];
  let sql = "SELECT * FROM tblsupplier WHERE hapus='T'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
    //res.send(JSON.stringify({"data": results}));
	for (let i = 0; i < results.length; i++) {
		aksi1= '<a href="javascript:void(0);" class="btn btn-sm btn-info edit"'+
				'data-id_supplier     ="'+results[i].id_supplier+
				'" data-nama_supplier ="'+results[i].nama_supplier+ 
				'" data-alamat        ="'+results[i].alamat+
				'" data-no_telephon   ="'+results[i].no_telephon+
				'" data-no_hp         ="'+results[i].no_hp+
				'" data-contact_person="'+results[i].contact_person+
				'">Edit</a>'
        aksi2= '<a href="javascript:void(0);" class="btn btn-sm btn-danger delete"'+
			   'data-id_supplier="'+results[i].id_supplier+'">Delete</a>'
		hasil[i]= [results[i].nama_supplier,
		         results[i].alamat,
				 results[i].no_telephon,
				 results[i].no_hp,
				 results[i].contact_person,
				 aksi1+aksi2];
	}
	res.send(JSON.stringify({"data": hasil}));
  });
});

app.post('/suppliers-add',(req, res) => {
	if (req.session.loggedin) {
		let sql = "INSERT INTO tblsupplier SET "+
				  "nama_supplier    ='"+req.body.nama_supplier+"', "+
				  "alamat           ='"+req.body.alamat+"', "+
				  "no_telephon      ='"+req.body.no_telephon+"', "+
				  "no_hp            ='"+req.body.no_hp+"', "+
				  "contact_person   ='"+req.body.contact_person+"'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;			
				res.redirect('/suppliers');
		});		
	}else{
		res.redirect('/');
	}
}); 

app.post('/suppliers-update',(req, res) => {
	if (req.session.loggedin) {
		let sql = "UPDATE tblsupplier SET "+
				  "nama_supplier    ='"+req.body.nama_supplier+"', "+
				  "alamat           ='"+req.body.alamat+"', "+
				  "no_telephon      ='"+req.body.no_telephon+"', "+
				  "no_hp            ='"+req.body.no_hp+"', "+
				  "contact_person   ='"+req.body.contact_person+"' "+
				  "WHERE id_supplier='"+req.body.id_supplier+"'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;			
				res.redirect('/suppliers');
		});		
	}else{
		res.redirect('/');
	}
}); 

//route for delete data
app.post('/suppliers-delete',(req, res) => {
  //let sql = "DELETE FROM tblpelanggan WHERE id_part='"+req.body.product_id+"'";
  let sql = "UPDATE tblsupplier SET hapus='Y' WHERE id_supplier='"+req.body.id_supplier+"'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/suppliers');
  });
});
module.exports = app;