require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

// Middle Wire
app.use(cors());
app.use(express.json());

const uri = process.env.MongoURL;
const client = new MongoClient(uri);

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACC_Token, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" });
        }
        req.decoded = decoded;
        next();
    });
}

const database = async () => {
    const userCollection = client.db("instalaren").collection("users");

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
        const token = jwt.sign(user, process.env.ACC_Token, {
            expiresIn: "1d",
        });
        res.send({ result, token });
    });

    // Get User by email
    app.get("/user/:email", async (req, res) => {
        const { email } = req.params;
        const filter = { email: email };
        const user = await userCollection.findOne(filter);
        res.send(user);
    });
};

database().catch((err) => console.log(`${err.name} ${err.message}`));

app.get("/", (req, res) => {
    res.send("Instalaren Server Running");
});

app.listen(port, () => {
    console.log("Server Run Okk");
});
