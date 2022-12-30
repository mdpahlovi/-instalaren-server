require("dotenv").config();
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

// Middle Wire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@instalaren.jia3ipa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

const database = async () => {
    const userCollection = client.db("instalaren").collection("users");
    const postCollection = client.db("instalaren").collection("posts");

    // Save User To DB , Generate & Sent JWT Token to site
    app.put("/user/:email", async (req, res) => {
        const { email } = req.params;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
            $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    });

    // Get User by email
    app.get("/user/:email", async (req, res) => {
        const { email } = req.params;
        const filter = { email: email };
        const user = await userCollection.findOne(filter);
        res.send(user);
    });

    // Save User To DB , Generate & Sent JWT Token to site
    app.put("/post/:id", async (req, res) => {
        const { id } = req.params;
        const post = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: post,
        };
        const result = await postCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    });

    app.get("/post/:id", async (req, res) => {
        const { id } = req.params;
        const filter = { _id: ObjectId(id) };
        const post = await postCollection.findOne(filter);
        res.send(post);
    });

    app.post("/post", async (req, res) => {
        const post = req.body;
        const result = await postCollection.insertOne(post);
        if (result.insertedId) {
            res.send({ message: "Successfully Added Post" });
        }
    });

    app.get("/posts", async (req, res) => {
        const curser = postCollection.find({});
        const posts = await curser.toArray();
        res.send(posts);
    });
};

database().catch((err) => console.log(`${err.name} ${err.message}`));

app.get("/", (req, res) => {
    res.send("Instalaren Server Running");
});

app.listen(port, () => {
    console.log("Server Run Okk");
});
