//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const exphbs = require('express-handlebars');

const session = require('express-session');

const bodyParser = require('body-parser');

var connection =require('./database');

var sparepart =require('./sparepart');

var customers =require('./customers');

var suppliers =require('./suppliers');

var typemesin =require('./typemesin');

var user =require('./user');

var barangmasuk =require('./barangmasuk');

var penjualan =require('./penjualan');

var barangkeluar =require('./barangkeluar');

var invoice =require('./invoice');

var api =require('./api');

const crypto = require('crypto');

//var cors = require('cors');

const app = express();

const md5sum = crypto.createHash('md5');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//app.use(cors());

//app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
//});

//set dynamic views file
app.set('views',path.join(__dirname,'views'));

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
	helpers: { todaysDate: () => new Date(), 
	           notif: () => '6+', 
			   mail: () => '9',
			   }
}));

//set view engine
app.set('view engine', 'hbs');
//set public folder as static folder for static file
app.use(express.static('public'));
//route untuk halaman home

app.get('/',(req, res) => {
  //render file home.hbs
   if (!req.session.loggedin) {
		res.render('login',{ msg: 'This is home page'});
   }else{
		res.redirect('/home');
   }
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = crypto.createHash('md5').update(request.body.password).digest('hex');
	if (username && password) {
		connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				request.session.namauser = results[0].nama_lengkap;
				if(results[0].level=="admin"){
					request.session.admin = true;
				}
				
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		//response.send('Please enter Username and Password!');
		response.redirect('/home');
		response.end();
	}
});

app.get('/home',(req, res) => {
  //render file home.hbs
   if (req.session.loggedin) {
		let chartData=[];
		let chartSumber=[];
		let d = new Date();
		let n = d.getFullYear();
		let m = d.getMonth()+1;
	    let omset = 0;
		let omsbln = 0;
		let omsmpl = 0;
		let jmlpro = 0;
		let sql   = "SELECT * FROM omzet_tahun WHERE tahun='" + n + "'";

		connection.query("SELECT * FROM rekaptrans_periode WHERE tahun='" + n + "'", (err, results) => {
			if(err) throw err;
			for (let i = 0; i < results.length; i++) {
				chartData[i]= results[i].omzet;
			}
		});	
		connection.query("SELECT * FROM sumber", (err, results) => {
			if(err) throw err;
			for (let i = 0; i < results.length; i++) {
				chartSumber[i]= results[i].sumber;
				//console.log(chartSumber[i]);
			}
		});	

		connection.query("SELECT count(*) as produk FROM tblsparepart WHERE hapus='T'", (err, results) => {
			if(err) throw err;
			if(results.length>0){
				jmlpro = results[0].produk;
			}else{
				jmlpro = 0;
			}
		});	
		connection.query("SELECT * FROM omzet_tokopedia WHERE bulan='" + m + "' AND tahun='" + n + "'", (err, results) => {
			if(err) throw err;
			if(results.length>0){
				omsmpl = results[0].omzet;
			}else{
				omsmpl = 0;
			}
		});	
		connection.query("SELECT * FROM omzet_shopee WHERE bulan='" + m + "' AND tahun='" + n + "'", (err, results) => {
			if(err) throw err;
			if(results.length>0){
				omsmpl = omsmpl + results[0].omzet;
			}else{
				omsmpl = omsmpl + 0;
			}
		});	
		connection.query("SELECT * FROM omzet_lazada WHERE bulan='" + m + "' AND tahun='" + n + "'", (err, results) => {
			if(err) throw err;
			if(results.length>0){
				omsmpl = omsmpl + results[0].omzet;
			}else{
				omsmpl = omsmpl + 0;
			}
		});	
		connection.query("SELECT * FROM omzet_bulan WHERE bulan='" + m + "' AND tahun='" + n + "'", (err, results) => {
			if(err) throw err;
			if(results.length>0){
				omsbln = results[0].omzet;
			}else{
				omsbln = 0;
			}
		});			   
		let query = connection.query(sql, (err, results) => {
			if(err) throw err;
			if(results.length>0){
				omset = results[0].omzet;
			}else{
				omset = 0;
			}
			res.render('home',{ namauser: req.session.namauser,
								admin: req.session.admin,
								omset: omset.toLocaleString(undefined,{ minimumFractionDigits: 0 }),
								tahun: n,
								omsbln: omsbln.toLocaleString(undefined,{ minimumFractionDigits: 0 }),
								bulan: m,
								omsmpl: omsmpl.toLocaleString(undefined,{ minimumFractionDigits: 0 }),
								jmlpro: jmlpro,
								chartData: chartData,
								nilai: chartData,
								sumber: chartSumber
								});
		});			   
   }else{
		res.redirect('/');
   }
   
});

app.get('/buttons',(req, res) => {
  //render file buttons.hbs
	if (req.session.loggedin) {
		res.render('buttons',{ namauser: req.session.namauser});
	}else{
		res.redirect('/');
	}
});

app.get('/cards',(req, res) => {
  //render file buttons.hbs
	if (req.session.loggedin) {
		res.render('cards',{ msg: 'This is home page'});
	}else{
		res.redirect('/');
	}
});

app.get('/utilities-color',(req, res) => {
  //render file color_utilities.hbs
	if (req.session.loggedin) {
		res.render('utilities-color',{ msg: 'This is home page'});
	}else{
		res.redirect('/');
	}
});

app.get('/utilities-border',(req, res) => {
  //render file border_utilities.hbs
	if (req.session.loggedin) {
		res.render('utilities-border',{ msg: 'This is home page'});
	}else{
		res.redirect('/');
	}
});

app.get('/utilities-animation',(req, res) => {
  //render file border_utilities.hbs
	if (req.session.loggedin) {
		res.render('utilities-animation',{ msg: 'This is home page'});
	}else{
		res.redirect('/');
	}
});

app.get('/utilities-other',(req, res) => {
  //render file border_utilities.hbs
	if (req.session.loggedin) {
		res.render('utilities-other',{ msg: 'This is home page'});
	}else{
		res.redirect('/');
	}
}); 

app.get('/charts',(req, res) => {
  //render file charts.hbs
	if (req.session.loggedin) {
		res.render('charts',{ msg: 'This is home page'});
	}else{
		res.redirect('/');
	}
}); 

app.get('/tables',(req, res) => {
  //render file tables.hbs
	if (req.session.loggedin) {
	  res.render('tables',{ employees:
	  [{ 
		name: 'Gloria Little',
		position: 'Systems Administrator',
		office: 'New York',
		age: '59',
		start_date: '2009/04/10',
		salary:	'$237,500'
		},
		{
		name: 'Bradley Greer',
		position: 'Software Engineer',
		office:	'London',
		age: '41',
		start_date:	'2012/10/13',
		salary:	'$132,000'
		},
		{
		name: 'Dai Rios',
		position: 'Personnel Lead',
		office: 'Edinburgh',
		age: '35',
		start_date:	'2012/09/26',
		salary:	'$217,500'
		},
		]});
	}else{
		res.redirect('/');
	}
}); 

app.use(api);

app.use(sparepart);

app.use(customers);

app.use(suppliers);

app.use(typemesin);

app.use(user);

app.use(barangmasuk);

app.use(penjualan);

app.use(invoice);

app.use(barangkeluar);

//req.session.destroy();
app.get('/logout',(req, res) => {
  //render file charts.hbs
  //res.render('charts',{ msg: 'This is home page'});
	req.session.destroy();
	res.redirect('/');
}); 

app.listen(8000, () => {
  console.log('Server is running at port 8000');
});