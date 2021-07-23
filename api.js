const express = require('express');
const bodyParser = require('body-parser');
const sprintf = require('sprintf-js').sprintf;
const vsprintf = require('sprintf-js').vsprintf;
const mysql = require('mysql');
var cors = require('cors');
var conn =require('./database');
const crypto = require('crypto');

const app = express();

const md5sum = crypto.createHash('md5');
 
// parse application/json
app.use(bodyParser.json());

app.use(cors());

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
 
//connect to database
//conn.connect((err) =>{
//  if(err) throw err;
//  console.log('Mysql Connected...');
//});
 
//tampilkan semua data product
app.get('/api-products',(req, res) => {
  let hasil=[];
  let sql = "SELECT * FROM tblsparepart WHERE hapus='T'";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    //res.send(JSON.stringify({"data": results}));
	for (let i = 0; i < results.length; i++) {
		aksi1= '<a href="javascript:void(0);" class="btn btn-sm btn-info edit" data-id="{{ id_part }}" data-product_name="{{ nama_part }}" data-product_price="{{ harga_part }}" data-stok_akhir="{{ jumlah_akhir }}">Edit</a>'
        aksi2= '<a href="javascript:void(0);" class="btn btn-sm btn-danger delete" data-id="{{ product_id }}">Delete</a>'
		hasil[i]= [results[i].nama_part,
		         results[i].harga_part,
				 results[i].jumlah_masuk,
				 results[i].jumlah_keluar,
				 results[i].jumlah_akhir,
				 aksi1+aksi2];
	}
	res.send(JSON.stringify({"data": hasil}));
  });
});
 
//tampilkan semua data product
app.get('/api-sparepart',(req, res) => {
  let sql = "SELECT * FROM saldo_all WHERE hapus='T'";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
		res.send(JSON.stringify(results));
  });
});

//tampilkan semua data penjualan
app.post('/api-penjualan',(req, res) => {	
	conn.query("SELECT * FROM view_penjualan WHERE periode='"+req.body.periode+"' ORDER BY no_bukti DESC", (err, results) => {
	if(err) throw err;
		res.send(JSON.stringify(results));
	});		
});

app.post('/api-penjualan_internal',(req, res) => {	
	conn.query("SELECT * FROM view_penjualan_internal WHERE periode='"+req.body.periode+"' ORDER BY no_bukti DESC", (err, results) => {
	if(err) throw err;
		res.send(JSON.stringify(results));
	});		
});

app.post('/api-barang_masuk',(req, res) => {	
	console.log(req.body.periode);
	conn.query("SELECT * FROM view_barangmasuk WHERE periode='"+req.body.periode+"' ORDER BY no_bukti DESC", (err, results) => {
	if(err) throw err;
		res.send(JSON.stringify(results));
	});		
});

//tampilkan semua data product
app.post('/api-login',(req, res) => {
	//console.log(req.body.userid);
	//console.log(req.body.password);
	var userid   = req.body.userid;
	var password = crypto.createHash('md5').update(req.body.password).digest('hex');
	var return_arr  = [];
	var row_array = [];
	let periode_kini = "";
	let periode_lalu = "";

	conn.query("SELECT * FROM setting WHERE parameter='periode_kini'", (err1, result1) => {
		periode_kini = result1[0].nilai;
	});

	conn.query("SELECT * FROM setting WHERE parameter='periode_lalu'", (err1, result1) => {
		periode_lalu = result1[0].nilai;
	});
	
	conn.query('SELECT * FROM user WHERE username = ? AND password = ?', [userid, password], function(error, results, fields) {
		if (results.length > 0) {
			row_array = {status:"BERHASIL", 
			             keterangan: "Login Berhasil. Selamat Bekerja !!!", 
						 nama_user: results[0].nama_lengkap,
						 id_user: results[0].id_user,
						 username: results[0].username,
						 lokasi: results[0].lokasi,
						 level: results[0].level,
						 periode_kini: periode_kini,
						 periode_lalu: periode_lalu
						 };
			return_arr[0] = row_array;
		} else {
			row_array['status']     = 'GAGAL';
			row_array['keterangan'] = 'Login Gagal. Invalid password !!!';
			
			return_arr[0] = row_array;
		}			
		res.send(JSON.stringify(return_arr));
	});
  
});
 
//tampilkan data product berdasarkan id
app.post('/api-bayar_klr',(req, res) => {
	
	let d = new Date();
	let n = d.getFullYear();
	let m = d.getMonth()+1;
	let h = d.getDate();
	let u = req.body.id_user;
	let p = req.body.periode
	let t = 0;
	let b = "BR"+(("00" + u).slice (-2))+"-"+p+(("00" + h).slice (-2));
	
	conn.query("SELECT MAX(cast(mid(no_bayar,15,5) as UNSIGNED)) as id_max FROM tblbayar WHERE mid(no_bayar,1,13)='"+b+"'", (err, results) => {
		if(err) throw err;
		var bayar = "BR"+(("00" + u).slice (-2))+"-"+p+(("00" + h).slice (-2))+"-"+(("00000" + (results[0].id_max+1)).slice (-5));
		
		let sql = "INSERT INTO tblbayar SET "+
				  "tgl_bayar	='"+req.body.tanggal+"', "+
				  "no_bayar		='"+bayar+"', "+
				  "periode		='"+req.body.periode+"', "+
				  "no_bukti		='"+req.body.nobukti+"', "+
				  "bayar		='"+req.body.bayar+"', "+
				  "user_input	='"+req.body.username+"', "+
				  "hapus		='T'";			
		let query = conn.query(sql, (err, results1) => {
			if(err) throw err;
			
			conn.query("SELECT SUM(bayar) AS byr FROM tblbayar WHERE no_bukti='"+req.body.nobukti+"' AND hapus='T'", (err, results2) => {
				if(err) throw err;
			
				conn.query("UPDATE trnsparepart_header SET "+
								"bayar = '"+results2[0].byr+"', "+
								"sisa  = grandtotal - bayar "+
							"WHERE no_bukti = '"+req.body.nobukti+"'", (err, results2) => {
					if(err) throw err;
					res.send(JSON.stringify([{"status": "SUKSES", "no_bukti": req.body.nobukti}]));
				});
			});
		});  
	});
});

//tampilkan data product berdasarkan id
app.get('/api/products/:id',(req, res) => {
  let sql = "SELECT * FROM tblsparepart WHERE nama_part like '%"+req.params.id+"%'";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});
 
//Tambahkan data product baru
app.post('/api/products',(req, res) => {
  let data = {product_name: req.body.product_name, product_price: req.body.product_price};
  let sql = "INSERT INTO tblsparepart SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});
 
//Edit data product berdasarkan id
app.put('/api/products/:id',(req, res) => {
  let sql = "UPDATE tblsparepart SET nama_part='"+req.body.product_name+"', harga_part='"+req.body.product_price+"' WHERE id_part="+req.params.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});
 
//Delete data product berdasarkan id
app.delete('/api/products/:id',(req, res) => {
  let sql = "DELETE FROM tblsparepart WHERE id_part="+req.params.id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});
 
 module.exports = app;
 
//Server listening
//app.listen(3000,() =>{
//  console.log('Server started on port 3000...');
//});