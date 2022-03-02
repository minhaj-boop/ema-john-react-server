const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//MIDDLEWARE
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f7vlo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        client.connect();
        const database = client.db('online_shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        //GET products API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            console.log(req.query);
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count();
            let products;

            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            } else {
                products = await cursor.toArray();
            }

            res.send({
                count,
                products
            });
        });
        //use POST to get data using keys
        app.post('/products/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } };
            const products = await productCollection.find(query).toArray();
            res.json(products);
        });

        //POST orders 
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }

}
run().catch(console.error);

app.get('/', (req, res) => {
    res.send('ema john server is running');
});

app.listen(port, () => {
    console.log('listening to port:', port);
})