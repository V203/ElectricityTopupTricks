// this is our
module.exports = function (pool) {

	// list all the streets the we have on records
	async function streets() {
		const streets = await pool.query(`select * from street`);
		return streets.rows;
	}

	// for a given street show all the meters and their balances
	async function streetMeters(streetId) {
		let results = await pool.query(`select * from electricity_meter join  street on street_id = electricity_meter.street_id where street_id = ${streetId} `);
		console.log(results.rows);
		return results.rows
	}

	// return all the appliances
	async function appliances() {
		return (await pool.query(`select * from appliance`)).rows;

	}

	// increase the meter balance for the meterId supplied
	async function topupElectricity(meterId, units) {
		await pool.query(`update electricity_meter set balance = balance + ${units} where electricity_meter.id = ${meterId} `);

	}

	// return the data for a given balance
	async function meterData(meterId) {
		return ((await pool.query(`SELECT * FROM electricity_meter where id = ${meterId}`)).rows['0']);

	}

	// decrease the meter balance for the meterId supplied
	async function useElectricity(meterId, units) {
		await pool.query(`update electricity_meter set balance = balance - ${units} where electricity_meter.id = ${meterId} `);
	}

	return {
		streets,
		streetMeters,
		appliances,
		topupElectricity,
		meterData,
		useElectricity
	}


}