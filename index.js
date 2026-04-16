const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simple-crud-server.awx9wzo.mongodb.net/?retryWrites=true&w=majority&appName=simple-crud-server`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Create a helper to get the collection without blocking the server start
async function getCollection() {
    // In Vercel, this ensures we reuse the connection if it's already open
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
    }
    return client.db('coffeeDB').collection('coffees');
}

// --- ROUTES ---

// GET all coffees
app.get('/coffees', async (req, res) => {
    try {
        const coffeesCollection = await getCollection();
        const result = await coffeesCollection.find().toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET a single coffee by ID
app.get('/coffees/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const coffeesCollection = await getCollection();
        const result = await coffeesCollection.findOne(query);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST a new coffee
app.post('/coffees', async (req, res) => {
    try {
        const newCoffee = req.body;
        const coffeesCollection = await getCollection();
        const result = await coffeesCollection.insertOne(newCoffee);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// PUT (Update) a coffee
app.put('/coffees/:id', async (req, res) => {
    try {
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
        const coffeesCollection = await getCollection();
        const result = await coffeesCollection.updateOne(filter, updateDoc);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// DELETE a coffee
app.delete('/coffees/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const coffeesCollection = await getCollection();
        const result = await coffeesCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('Coffee server is running smoothly!');
});

// Start server (for local testing)
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Export for Vercel
module.exports = app;