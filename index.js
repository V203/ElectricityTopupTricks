const express = require('express');
const exphbs = require('express-handlebars');
const pg = require('pg');
const Pool = pg.Pool;

const app = express();
const PORT = process.env.PORT || 3017;

const ElectricityMeters = require('./electricity-meters');

const connectionString = process.env.DATABASE_URL || 'postgresql://codex-coder:pg123@localhost:5432/topups';

const pool = new Pool({
	connectionString,ssl: {
		rejectUnauthorized: false
	  }
});

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const electricityMeters = ElectricityMeters(pool);

app.get('/', function (req, res) {
	res.redirect('/streets');
});

app.get('/streets', async function (req, res) {
	const streets = await electricityMeters.streets();
	// console.log(streets);
	res.render('streets', {
		streets
	});
});

app.get('/meters/:street_id', async function (req, res) {
	let street_id = req.params.street_id
	// console.log();
	let streets = await electricityMeters.streets();
	let meters = await electricityMeters.streetMeters(street_id);
	// use the streetMeters method in the factory function...
	// send the street id in as sent in by the URL parameter street_id - req.params.street_id

	// create  template called street_meters.handlebars
	// in there loop over all the meters and show them on the screen.
	// show the street number and name and the meter balance

	res.render('meters', {
		meters, street_id,
		streets
	});
});

app.get('/meters/use/:meter_id', async function (req, res) {
	let meter_id = req.params.meter_id
	let meters_id = await electricityMeters.meterData(meter_id)

	let appliance = await electricityMeters.appliances();

	// show the current meter balance and select the appliance you are using electricity for
	res.render('use_electicity', {
		appliance,
		meters_id
	});
});

app.post('/meters/use/:meter_id', async function (req, res) {

	// update the meter balance with the usage of the appliance selected.
	res.render(`/meters/user/${req.params.meter_id}`);

});

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function () {
	console.log(`App started on port ${PORT}`)
});