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
        const usersCollection =database.collection("users");

        //Get All Pakages
        app.get('/tourPakages',async(req,res)=>{
            const cursor = await pakagesCollection.find({});
            const allPakages = await cursor.toArray();
            res.send(allPakages);
        })
        //Get Single Pakage
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
        //Get Orders Api
        app.get('/orders',async(req,res)=>{
            const cursor = await ordersCollection.find({});
            const allOrders = await cursor.toArray();
            res.send(allOrders);
        })
        //Delete single item from orders Api
        app.delete('/orders/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result)
        })
        //Add Pakage Api
        app.post('/tourPakages',async(req,res)=>{
            console.log('hiiting the pakage')
            const newPakage = req.body;
            console.log(newPakage);
            const pakage = await pakagesCollection.insertOne(newPakage);
            res.json(pakage);
        })
        //Added user to Db 
        app.post('/users', async (req,res)=>{
            const user = req.body;
            console.log(user)
            const result = await usersCollection.insertOne(user)
            res.json(result)
        })
         //Added user to db using upsert
         app.put('/users', async(req,res)=>{
            const user = req.body;
            console.log(user)
            const filter = {email: user.email};
            const options = { upsert : true};
            const update = {$set : user}
            const result =await usersCollection.updateOne(filter,update,options);
            res.json(result)
        })
         //Added Admin
         app.put('/users/admin',async(req,res) =>{
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        //Check Admin
        app.get('/users/:email' , async (req,res)=>{
            const email = req.params.email; 
            const query = {email : email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin : isAdmin})
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