// express related
const express = require("express");
const app = express();
app.use(require("morgan")("dev"));
app.use(express.json());
const PORT = process.env.PORT || 3000;

// db related
const {
    client,
    createTables,
    createCustomer,
    fetchCustomers,
    createRestaurant,
    fetchRestaurants,
    createReservation,
    fetchReservations,
    destroyReservation,
} = require("./db");

// route
// fetch all customers
app.get("/api/customers", async (req, res, next) => {
    try {
        res.send(await fetchCustomers());
    } catch (error) {
        next(error);
    }
});

// create a customer
app.post("/api/customers", async (req, res, next) => {
    try {
        res.status(201).send(await createCustomer(req.body.name));
    } catch (error) {
        next(error);
    }
});

// fetch all restaurants
app.get("/api/restaurants", async (req, res, next) => {
    try {
        res.send(await fetchRestaurants());
    } catch (error) {
        next(error);
    }
});

// create a restaurant
app.post("/api/restaurants", async (req, res, next) => {
    try {
        res.status(201).send(await createRestaurant(req.body.name));
    } catch (error) {
        next(error);
    }
});

// fetch all reservations
app.get("/api/reservations", async (req, res, next) => {
    try {
        res.send(await fetchReservations());
    } catch (error) {
        next(error);
    }
});

// create a reservation
app.post("/api/customers/:id/reservations", async (req, res, next) => {
    try {
        res.status(201).send(
            await createReservation(
                req.body.date,
                req.body.party_count,
                req.params.id,
                req.body.restaurant_id
            )
        );
    } catch (error) {
        next(error);
    }
});

// delete a reservation
app.delete(
    "/api/customers/:customer_id/reservations/:reservation_id",
    async (req, res, next) => {
        try {
            await destroyReservation(
                req.params.customer_id,
                req.params.reservation_id
            );
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
);

// init
const init = async () => {
    try {
        await client.connect();
        await createTables();

        const [larry, curly, moe] = await Promise.all([
            createCustomer("larry"),
            createCustomer("curly"),
            createCustomer("moe"),
        ]);

        const [pizza, taco, burger] = await Promise.all([
            createRestaurant("pizza hut"),
            createRestaurant("taco bell"),
            createRestaurant("burger king"),
        ]);

        const [res1, res2, res3] = await Promise.all([
            createReservation("2024-03-04 18:00:00", 4, larry.id, pizza.id),
            createReservation("2024-03-05 19:00:00", 2, curly.id, taco.id),
            createReservation("2024-03-06 20:00:00", 6, moe.id, burger.id),
        ]);

        console.log("db seeded.");

        app.listen(PORT, () => {
            console.log(`Server started and listening on ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
};

init();
