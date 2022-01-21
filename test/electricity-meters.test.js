const assert = require("assert");
const pg = require('pg');
const Pool = pg.Pool;
const ElectricityMeters = require('../electricity-meters');

const connectionString = process.env.DATABASE_URL || 'postgresql://codex-coder:pg123@localhost:5432/topups_test';

const pool = new Pool({
	connectionString
});

describe("The Electricity meter", function () {

	this.beforeAll(function () {
		pool.query(`update electricity_meter set balance = 50`);
	});

	it("should see all the streets", async function () {
		const electricityMeters = ElectricityMeters(pool);
		const streets = await electricityMeters.streets();

		const streetList = [
			{
				"id": 1,
				"name": "Miller Street"
			},
			{
				"id": 2,
				"name": "Mathaba Crescent"
			},
			{
				"id": 3,
				"name": "Vilakazi Road"
			}]


		assert.deepStrictEqual(streetList, streets);

	});


	it("should see all the appliances", async function () {

		const electricityMeters = ElectricityMeters(pool);
		const appliances = await electricityMeters.appliances();
		let expected = [
			{ id: 1, name: 'Stove', rate: '4.50' },
			{ id: 2, name: 'TV', rate: '1.80' },
			{ id: 3, name: 'Heater', rate: '3.50' },
			{ id: 4, name: 'Fridge', rate: '4.00' },
			{ id: 5, name: 'Kettle', rate: '2.70' }
		]

		// console.log(appliances);
		assert.deepStrictEqual(expected, appliances);

	});

	it("should be able to topup electricity", async function () {

		const electricityMeters = ElectricityMeters(pool);
		const appliances = await electricityMeters.topupElectricity(3, 20);

		const meterData = await electricityMeters.meterData(3);

		assert.deepStrictEqual(70, Number(meterData.balance));

	});

	it("should be able to use electricity", async function () {

		const electricityMeters = ElectricityMeters(pool);
		const appliances = await electricityMeters.useElectricity(2, 20);
		const meterData = await electricityMeters.meterData(2);
		assert.deepStrictEqual(30, Number(meterData.balance));

	});

	it('We should be able select A street using the join clause', async () => {
		const electricityMeters = ElectricityMeters(pool);
		let actual = await electricityMeters.streetMeters(2);
		// console.log(actual);
		let expected = [
			{
				id: 2,
				street_number: '12',
				street_id: 2,
				balance: '50.00',
				meter_number: null,
				name: 'Mathaba Crescent'
			},
			{
				id: 2,
				street_number: '7',
				street_id: 2,
				balance: '50.00',
				meter_number: null,
				name: 'Mathaba Crescent'
			},
			{
				id: 2,
				street_number: '5',
				street_id: 2,
				balance: '50.00',
				meter_number: null,
				name: 'Mathaba Crescent'
			}
		]

		assert.deepStrictEqual(expected, actual);

	})

	it("We should be able to return the house hold with the lowest balance", async () => {

		const electricityMeters = ElectricityMeters(pool);

		let actual = await electricityMeters.lowestBalanceMeter();
		let expected = [
			{
				id: 2,
				street_number: '6',
				street_id: 1,
				balance: '30.00',
				meter_number: null
			}
		]

		assert.deepStrictEqual(expected, actual);

	});


	it("We should be able to return the house hold with the Highest  balance", async () => {

		const electricityMeters = ElectricityMeters(pool);

		await electricityMeters.topupElectricity(3, 20);
		let actual = await electricityMeters.highestBalanceStreet();
		let expected = [{ name: 'Miller Street', sum: '170.00' }]

		assert.deepStrictEqual(expected, actual);

	});

	it("We should be to return the total sum of the street balances", async () => {
		const electricityMeters = ElectricityMeters(pool);
		let actual = await electricityMeters.streetBalances();
		
		let expected = [
			{ name: 'Mathaba Crescent', sum: '150.00' },
			{ name: 'Vilakazi Road', sum: '150.00' },
			{ name: 'Miller Street', sum: '170.00' }
		]

		assert.deepStrictEqual(expected, actual);
	})

	this.afterAll(function () {
		pool.end();
	});

});