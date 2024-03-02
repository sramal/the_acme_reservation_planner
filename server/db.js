const pg = require("pg");
const client = new pg.Client(
    process.env.DATABASE_URL ||
        "postgres://localhost/acme_reservation_planner_db"
);

const createTables = async () => {
    const SQL = `
        DROP TABLE IF EXISTS reservations;
        DROP TABLE IF EXISTS customers;
        DROP TABLE IF EXISTS restaurants;

        CREATE TABLE customers(
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL
        );

        CREATE TABLE restaurants(
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL
        );

        CREATE TABLE reservations(
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            reservation_date TIMESTAMP NOT NULL,
            party_count INTEGER NOT NULL,
            restaurant_id uuid REFERENCES restaurants(id) NOT NULL,
            customer_id uuid REFERENCES customers(id) NOT NULL
        );
    `;

    await client.query(SQL);
};

const createCustomer = async (name) => {
    return (
        await client.query(
            `INSERT INTO customers(name) VALUES($1) RETURNING *;`,
            [name]
        )
    ).rows[0];
};

const fetchCustomers = async () => {
    return (
        await client.query(`
            SELECT * FROM customers;
         `)
    ).rows;
};

const createRestaurant = async (name) => {
    return (
        await client.query(
            `INSERT INTO restaurants(name) VALUES($1) RETURNING *;`,
            [name]
        )
    ).rows[0];
};

const fetchRestaurants = async () => {
    return (
        await client.query(`
            SELECT * FROM restaurants;
         `)
    ).rows;
};

const createReservation = async (
    reservation_date,
    party_count,
    customer_id,
    restaurant_id
) => {
    return (
        await client.query(
            `INSERT INTO reservations(reservation_date, party_count, customer_id, restaurant_id)
             VALUES($1, $2, $3, $4) RETURNING *;`,
            [reservation_date, party_count, customer_id, restaurant_id]
        )
    ).rows[0];
};

const fetchReservations = async () => {
    return (
        await client.query(`
            SELECT * FROM reservations;
         `)
    ).rows;
};

const destroyReservation = async (customer_id, reservation_id) => {
    return await client.query(
        `
            DELETE FROM reservations
            WHERE customer_id = $1 and id = $2
        `,
        [customer_id, reservation_id]
    );
};

module.exports = {
    client,
    createTables,
    createCustomer,
    fetchCustomers,
    createRestaurant,
    fetchRestaurants,
    createReservation,
    fetchReservations,
    destroyReservation,
};
