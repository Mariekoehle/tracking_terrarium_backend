const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;
//MONGO DB
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://marie:Rdm0LsnFudSUPuA7@cluster0.32yao.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var db;
var userData;
var sessions = {};
dbClient.connect(err => {
    console.log("Connecting to User Service ...");
    db = dbClient.db("moistureTracking");
    userData = db.collection("users");
});
//EXPRESS:
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
const corsSettings = {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
};
app.use(cors(corsSettings));
const port = 3001;
app.listen(port, () => {
    console.log(`user data service live @ http://localhost:${port}`);
});
app.post('/api/register', (req, res) => {
    console.log("registering new user");
    let user = req.body;
    console.log(user);
    user.createdAt = new Date();
    user.hashedPass = bcrypt.hashSync(user.password, saltRounds);
    delete user.password;
    console.log(user);
    userData.insertOne(user, (err, dbres) => {
        // console.log("showing user's password to the world");
        if (err) {
            console.log("error");
            res.status(500).send({
                "action": "register",
                "success": false,
                "message": "error while inserting into mongoDB",
                "error": err
            });
        }
        else {
            console.log("created new user");
            res.status(200).send({
                "action": "register",
                "success": true,
                "message": "created new user",
                "error": null
            });
        }
    })
})
app.post('/api/login', (req, res) => {
    console.log("logging in user");
    let sentdata = req.body;
    userData.findOne({ username: sentdata.username })
        .then((dbres) => {
            console.log("found user");
            if (bcrypt.compareSync(sentdata.password, dbres.hashedPass)) {
                console.log("login successful");
                let token = uuidv4();
                createSession(dbres, token);
                // console.log(sessions);
                res.status(200).send({
                    action: "login",
                    success: true,
                    message: "logged in",
                    error: null,
                    token: token
                });
            }
            else {
                res.status(500);
            }
        })
})
function createSession(userData, token) {
    sessions[token] = {
        userId: userData._id,
        createdAt: new Date(),
        modifiedAt: new Date(),
        token: token
    }
}