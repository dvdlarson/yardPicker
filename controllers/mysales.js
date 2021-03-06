var path = require("path");
var sale = require("../models/");
module.exports = function (app) {
	//no account needed for the following routes//////////////////////////////////////////////////////
	//home page route
	app.get("/", function (req, res) {
		console.log("router.get");
		res.render("index", {
			style: "index"
		});
	});

	//create account
	app.get('/signup', (req, res) => {
		res.render("signup", {
			style: "signup"
		});
	});

	//login page
	app.get("/login", function (req, res) {

		console.log("saved route: " + req.session.returnTo);
		res.render("login", {
			style: "login"
		});
	});

	//go to the buyer's main page 
	app.get("/buy", function (req, res) {
		// gets the data from the userinput and creates a handlebar object will that data
		sale.Sale.findAll({})
			.then(function (dbSale) {
				var hbsObject = {
					sale: dbSale,
					style: "buy",
				};
				// send to the buy file to display the sales
				res.render("buy", hbsObject);
			});
	});

	//gets buyer's info and pushes it to /buy page
	app.get("/api/buy", function (req, res) {
		sale.Sale.findAll({})
			.then(function (dbSales) {
				res.send(dbSales);
			});
	});

	//check for users' info to log in
	app.get("/api/users", function (req, res) {
		console.log("/api/users: " + req.session.returnTo);
		sale.User.findAll({}).then(function (data) {
			for (var i = 0; i < data.length; i++) {
				if (req.query.username === data[i].dataValues.username &&
					req.query.password === data[i].dataValues.password) {
					req.session.user = data[i];
					if (!req.session.returnTo) {
						res.redirect('/');
					}

					res.redirect(req.session.returnTo);
					delete req.session.returnTo;
				}
			}
		});
	});

	//sends the original requested route to the front end login js
	app.get("/origpath", function (req, res) {
		var originalPath = req.session.returnTo;
		console.log("originalPath: " + originalPath);
		res.send(originalPath);
	});

	//post user information to database
	app.post("/api/users", function (req, res) {
		console.log(JSON.stringify(req.body) + "server side")
		sale.User.create({
			username: req.body.username,
			email: req.body.email,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			city: req.body.city,
			state: req.body.state,
			zip_cd: req.body.zip_cd,
			password: req.body.password
		}).then(function (userInfo) {
			res.json(userInfo);
		});
	});

	//account needed for all routes below/////////////////////////////////////////////////////////////////
	app.use(function (req, res, next) {
		if (req.session.user == null) {
			req.session.returnTo = req.path;
			// if user is not logged-in redirect back to login page //
			res.redirect('/login');
		} else {
			next();
		}
	});

	//go to the sale form
	app.get("/sale", function (req, res) {
		res.sendFile(path.join(__dirname, "../public/html/sale_form.html"));
	});

	//go to the favorites page
	app.get("/favorites", function (req, res) {
		console.log("/favorites");
		sale.Favorite.findAll({
			where: {
				UserId: req.session.user.id,
			},
			include: [sale.Sale]
		}).then(function (fav) {
			var hbsObject = {
				fav: fav
				//style: "newsale"
			};
			res.render("mylist", hbsObject);
		});
	});

	//pushes favorite's info to page
	app.get("/api/favorites", function (req, res) {
		console.log("user.id: " + req.session.user.id);
		sale.Favorite.findAll({
			where: {
				UserId: req.session.user.id,
			},
			include: [sale.Sale]
		}).then(function (fav) {
			console.log(fav);
			res.send(fav);
		});
	});

	//edit a sale page
	app.get("/edit/:id", function (req, res) {
		sale.Sale.findOne({
			where: {
				id: req.params.id
			}
		}).then(function (dbSale) {
			var hbsObject = {
				sale: dbSale,
				style: "newsale"
			};
			console.log(hbsObject.sale.title);
			res.sendFile(path.join(__dirname, "../public/html/edit_sale.html"));
		});
	});

	//delete a sale
	app.put("/api/delete/:id", function (req, res) {
		var id = req.params.id;
		console.log("deleting sale: " + id);
		sale.Sale.update({
			active: 0
		}, {
			where: {
				id: id
			}
		}).then(function (data) {
			res.render("manage");
		})
	});

	//routes to the page to manage all your sales
	app.get("/manage", function (req, res) {
		console.log("/manage");
		sale.Sale.findAll({
				where: {
					UserId: req.session.user.id
				}
			})
			.then(function (dbSale) {

				var hbsObject = {
					sale: dbSale,
					style: "manage"
				};
				res.render("manage", hbsObject);
			});

	});

	//routes to the edit sale page
	app.get("/api/edit/:id", function (req, res) {

		sale.Sale.findOne({
				where: {
					id: req.params.id
				}
			})
			.then(function (dbSale) {

				var hbsObject = {
					sale: dbSale
				};
				// send to the home file to display the sales
				console.log(dbSale);
				// res.json(dbSale);
				res.send(hbsObject);
			});

	});

	// //post user information to database
	// app.post("/api/users", function (req, res) {
	// 	console.log(JSON.stringify(req.body) + "server side")
	// 	sale.User.create({
	// 		username: req.body.username,
	// 		email: req.body.email,
	// 		first_name: req.body.first_name,
	// 		last_name: req.body.last_name,
	// 		city: req.body.city,
	// 		state: req.body.state,
	// 		zip_cd: req.body.zip_cd,
	// 		password: req.body.password
	// 	}).then(function (userInfo) {
	// 		res.json(userInfo);
	// 	});
	// });

	//posts sale information to database
	app.post("/api/addsale", function (req, res) {
		console.log(JSON.stringify(req.body) + "server side")
		sale.Sale.create({
			title: req.body.title,
			sale_type: req.body.sale_type,
			start_date: req.body.start_date,
			end_date: req.body.end_date,
			start_time: req.body.start_time,
			end_time: req.body.end_time,
			on_street_parking: 1,
			inside_outside: 1,
			weather_cancel: 1,
			items_desc: req.body.items_desc,
			city: req.body.city,
			state: req.body.state,
			zip_cd: req.body.zip_cd,
			full_address: req.body.full_address,
			active: req.body.active,
			UserId: req.session.user.id

		}).then(function (userInfo) {
			res.json(userInfo);
		});
	});

	//add a sale to user's favorite list
	app.post("/api/addfav", function (req, res) {
		console.log("saleId: " + req.body.saleId);
		var saleId = req.body.saleId
		sale.Favorite.create({
			SaleId: saleId,
			UserId: req.session.user.id
		}).then(function (result) {
			console.log("added favorite for userid: " + req.session.user.id);
			if (!req.session.user.id) {
				return res.error;
			}
		});
	});

	//update a sale
	app.put("/api/editsale/:id", function (req, res) {
		console.log("sale ID: " + req.params.id);
		sale.Sale.update({
			title: req.body.title,
			sale_type: req.body.sale_type,
			start_date: req.body.start_date,
			end_date: req.body.end_date,
			start_time: req.body.start_time,
			end_time: req.body.end_time,
			on_street_parking: req.body.on_street_parking,
			inside_outside: req.body.inside_outside,
			weather_cancel: req.body.weather_cancel,
			items_desc: req.body.items_desc,
			city: req.body.city,
			state: req.body.state,
			zip_cd: req.body.zip_cd,
			address: req.body.address,
			full_address: req.body.full_address,

		}, {
			where: {
				id: req.params.id
			}
		}).then(function (userInfo) {
			console.log(userInfo);
			res.json(userInfo);
		});
	});

	//testing new features
	app.get("/test", function (req, res) {
		res.render("test");
	});

	//photo upload test
	app.post('/upload', function (req, res) {
		if (!req.files)
			return res.status(400).send('No files were uploaded.');

		// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
		let sampleFile = req.files.sampleFile;
		let filename = req.files.sampleFile.name;
		let path = 'C:\\Users\\Dave\\Desktop\\HOMEWORK\\PROJECT_2\\mySaleFinder\\public\\uploads\\' + filename;

		// Use the mv() method to place the file somewhere on your server
		sampleFile.mv(path, function (err) {
			if (err)
				return res.status(500).send(err);

			res.send('File uploaded!');
		});
	});

}


