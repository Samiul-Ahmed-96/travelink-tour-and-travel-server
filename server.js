const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());
//Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iy3km.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        console.log('db connected')
        const database = client.db("travelink");
        const pakagesCollection = database.collection("travel-pakage");
        const ordersCollection =database.collection("orders");

        //Get Api
        app.get('/tourPakages',async(req,res)=>{
            const cursor = await pakagesCollection.find({});
            const allPakages = await cursor.toArray();
            res.send(allPakages);
        })
        //Get Single Service
        app.get('/tourPakages/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const singlePakage = await pakagesCollection.findOne(query);
            res.json(singlePakage);
        })
        //Add orders Api
        app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Travelink Server Running');
});

app.listen(port, () => {
    console.log('Travelink Server Running', port);
})