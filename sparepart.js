const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const app = express();

var connection =require('./database');

app.get('/spareparts',(req, res) => {
  //render file spareparts.hbs
	if (req.session.loggedin) {
		let sql = "SELECT * FROM tblsparepart WHERE hapus='T'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;
				res.render('spareparts',{
					results: results, namauser: req.session.namauser
				});
		});		
		//res.render('spareparts',{ employees: res});
	}else{
		res.redirect('/');
	}
}); 

//tampilkan semua data product
app.post('/spareparts-api',(req, res) => {
  let hasil=[];
  let sql = "SELECT * FROM tblsparepart WHERE hapus='T'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
    //res.send(JSON.stringify({"data": results}));
	for (let i = 0; i < results.length; i++) {
		aksi1= '<a href="javascript:void(0);" class="btn btn-sm btn-info edit"'+
				'data-id_part       ="'+results[i].id_part+
				'" data-nama_part   ="'+results[i].nama_part+ 
				'" data-harga_part  ="'+results[i].harga_part+
				'" data-stok_awal   ="'+results[i].jumlah_stok+
				'" data-stok_masuk  ="'+results[i].jumlah_masuk+
				'" data-stok_keluar ="'+results[i].jumlah_keluar+
				'" data-stok_akhir  ="'+results[i].jumlah_akhir+
				'">Edit</a>'
        aksi2= '<a href="javascript:void(0);" class="btn btn-sm btn-danger delete"'+
			   'data-id_part="'+results[i].id_part+'">Delete</a>'
		hasil[i]= [results[i].nama_part,
		         results[i].harga_part,
				 results[i].jumlah_stok,
				 results[i].jumlah_masuk,
				 results[i].jumlah_keluar,
				 results[i].jumlah_akhir,
				 aksi1+aksi2];
	}
	res.send(JSON.stringify({"data": hasil}));
  });
});

app.post('/sparepat-add',(req, res) => {
	if (req.session.loggedin) {
		let sql = "INSERT INTO tblsparepart SET "+
				  "nama_part   ='"+req.body.nama_part+"', "+
				  "harga_part  ='"+req.body.harga_part+"', "+
				  "jumlah_akhir='"+req.body.stok_akhir+"', "+
				  "jumlah_stok ='"+req.body.stok_awal+"'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;			
				res.redirect('/spareparts');
		});		
	}else{
		res.redirect('/');
	}
}); 

app.post('/sparepat-update',(req, res) => {
	if (req.session.loggedin) {
		let sql = "UPDATE tblsparepart SET "+
				  "nama_part   ='"+req.body.nama_part+"', "+
				  "harga_part  ='"+req.body.harga_part+"', "+
				  "jumlah_akhir='"+req.body.stok_akhir+"', "+
				  "jumlah_stok ='"+req.body.stok_awal+"' "+
				  "WHERE id_part='"+req.body.id_part+"'";
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;			
				res.redirect('/spareparts');
		});		
	}else{
		res.redirect('/');
	}
}); 

//route for delete data
app.post('/sparepat-delete',(req, res) => {
	console.log(req.body.id);
  let sql = "UPDATE tblsparepart SET hapus='Y' WHERE id_part='"+req.body.id+"'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/spareparts');
  });
});
module.exports = app;