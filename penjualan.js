const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const app = express();

var cors = require('cors');
var connection =require('./database');
var periode_kini = "";
app.use(cors());

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

app.get('/penjualan',(req, res) => {
  //render file penjualan.hbs
	if (req.session.loggedin) {
		res.render('penjualan',{
			namauser: req.session.namauser
		});
	}else{
		res.redirect('/');
	}
}); 

connection.query("SELECT * FROM setting WHERE parameter='periode_kini'", (err, result) => {
	periode_kini = result[0].nilai;
});  

//tampilkan semua data product
app.post('/penjualan-api',(req, res) => {
  let hasil=[];
  /*
  connection.query("SELECT "+
					"trnsparepart_header.*, "+
					"tblpelanggan.nama_pelanggan "+
					"FROM trnsparepart_header "+
					"LEFT JOIN tblpelanggan ON trnsparepart_header.kepada=tblpelanggan.id_pelanggan "+
					"WHERE trnsparepart_header.hapus='T' "+
					"AND trnsparepart_header.jenis_transaksi='EXTERNAL' "+
					"AND trnsparepart_header.periode='"+periode_kini+"' "+
					"ORDER BY trnsparepart_header.id_trans DESC", (err, results) => {
	*/
  connection.query("SELECT * FROM penjualan WHERE periode = '"+periode_kini+"'", (err, results) => {	
    if(err) throw err;
	for (let i = 0; i < results.length; i++) {
		aksi1= '<a href="javascript:void(0);" class="btn btn-sm btn-info edit"'+
				'data-no_bukti="'+results[i].no_bukti+
				'">Edit</a>'
        aksi2= '<a href="javascript:void(0);" class="btn btn-sm btn-danger delete"'+
			   'data-no_bukti="'+results[i].no_bukti+'">Delete</a>'
		var ts_hms = new Date(results[i].tanggal);
		hasil[i]= [results[i].no_bukti,
		         ts_hms.getFullYear() + '-' + ("0" + (ts_hms.getMonth() + 1)).slice(-2) + '-' + ("0" + (ts_hms.getDate())).slice(-2),
				 results[i].nama_pelanggan,
				 results[i].keterangan,
				 results[i].grandtotal,
				 results[i].bayar,
				 results[i].sisa,
				 results[i].kelebihan_bayar,
				 results[i].user_input,
				 aksi1+aksi2];
	}
	res.send(JSON.stringify({"data": hasil}));
  });
});

app.post('/penjualan-add',(req, res) => {
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
				res.redirect('/penjualan');
		});		
	}else{
		res.redirect('/');
	}
}); 

app.post('/penjualan-update',(req, res) => {
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
				res.redirect('/penjualan');
		});		
	}else{
		res.redirect('/');
	}
}); 

//route for delete data
app.post('/penjualan-delete',(req, res) => {
  let sql = "UPDATE tblpelanggan SET hapus='Y' WHERE id_pelanggan='"+req.body.id_pelanggan+"'";
  let query = connection.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/penjualan');
  });
});
module.exports = app;