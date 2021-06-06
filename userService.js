const {v4: uuidv4} = require('uuid');
let db, users;
let sessions = {};

//MONGO DB
const MongoClient = require('mongodb').MongoClient;
const dbaccess = require('./config').config;
const uri = `mongodb+srv://${dbaccess.user}:${dbaccess.password}@${dbaccess.host}/${dbaccess.name}?retryWrites=true&w=majority`;
const dbClient = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
dbClient.connect(err => {
  if (err) {
    console.log(err);
  }
  else {
    console.log("connection to database established");
    db = dbClient.db("moistureTracking");

    db.createCollection("users", function (err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log("created collection 'users'.");
      }
    });
    users = db.collection("users");
  }
});

//EXPRESS
const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const port = 3002;

app.listen(port, () => {
  console.log(`user service live @ http://localhost:${port}`);
});

app.post('/api/register', (req, res) => {
  if (users) {
    let user = req.body;
    user.createdAt = new Date();
    console.log(user);
    users.insertOne(user, (dbErr, dbRes) => {
      if (dbErr) {
        console.log(dbErr);
      } else {
        //console.log("created new user " + user.username);
        res.send({
          action: "register",
          result: "success."
        });
      }
    });
  } else {
    res.send({
      action: "register",
      result: "user database missing."
    });
  }
});

app.post('/api/login', (req, res) => {
  console.log("Login try:");
  console.log(req.body);
  if (users) {
    users.find({username: req.body.username}).next()
      .then((dbres) => {
        if (dbres) {
          console.log("found username in database.");
          if (dbres.password === req.body.password) {
            const session = createSession(dbres._id);
            sessions[session.token] = session;
            console.log("\nCurrently active sessions:");
            console.log(sessions);
            res.send({
              action: "login",
              result: "success",
              token: session.token,
            });
          } else {
            res.send({
              action: "login",
              result: "wrong password",
              token: null,
            });
          }
        } else {
          console.log("couldn't find user in database.");
          res.send({
            action: "login",
            result: "unknown user",
            token: null,
          });
        }
      });
  }
});

app.post('/api/logout', (req, res) => {
  const token = req.body.token;
  if (checkToken) {
    delete session[token];
    res.send({
      action: "logout",
      result: "success"
    });
  } else {
    res.send({
      action: "logout",
      result: "invalid token"
    });
  }
});

app.post('/api/validateToken', (req, res) => {
  let token = req.body.token;
  res.send({
    action: "validateToken",
    result: checkToken(token) ? "success" : "invalid token",
  });
});

function createSession(userId) {
  return {
    createdAt: new Date(),
    lastAction: new Date(),
    userId: userId,
    token: uuidv4()
  };
}

function checkToken(token) {
  return sessions.hasOwnProperty(token);
}