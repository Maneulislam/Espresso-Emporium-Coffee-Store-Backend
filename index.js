const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
// FIX 1: Use process.env.PORT for deployment platforms
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simple-crud-server.awx9wzo.mongodb.net/?retryWrites=true&w=majority&appName=simple-crud-server`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server
        await client.connect();

        const database = client.db('coffeeDB');
        const coffeesCollection = database.collection('coffees');

        // --- ROUTES ---

        // GET all coffees
        app.get('/coffees', async (req, res) => {
            const cursor = coffeesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // GET a single coffee by ID
        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeesCollection.findOne(query);
            res.send(result);
        });

        // POST a new coffee
        app.post('/coffees', async (req, res) => {
            const newCoffee = req.body;
            const result = await coffeesCollection.insertOne(newCoffee);
            res.send(result);
        });

        // PUT (Update) a coffee
        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedCoffee = req.body;
            const updateDoc = {
                $set: {
                    name: updatedCoffee.name,
                    chef: updatedCoffee.chef,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo,
                }
            };
            const result = await coffeesCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // DELETE a coffee
        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeesCollection.deleteOne(query);
            res.send(result);
        });

        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error("Connection error:", error);
    }
}

run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
    res.send('Coffee server is running smoothly!');
});

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
// Add this at the end of index.js
module.exports = app;