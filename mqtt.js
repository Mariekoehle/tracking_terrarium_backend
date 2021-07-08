//Imports und Variablen
var mqtt = require('mqtt')
var mqttclient  = mqtt.connect('mqtt://mqtt.hfg.design')
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Hanna:7b5aPGpz9fKtt1DA@cluster0.6b4xl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbclient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var db, users;
var data;
let sessions = {};
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var express = require('express')
const app = express()
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
const port = 3000
const cors = require('cors');
const corsSettings = {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
};

app.use(cors(corsSettings));
app.listen(port, () => {
  console.log(`data service live @ http://localhost:${port}`);
});
//function Sammlungen
function createSession(userData, token) {
  sessions[token] = {
    userId: userData._id,
    createdAt: new Date(),
    modifiedAt: new Date(),
    token: token
  }
  console.log(sessions)
}
function saveData(message) {
    let doc = JSON.parse(message);
    doc.createdat = new Date();
    if (data) {
      data.insertOne(doc,  (err, res) => {
        //console.log(err, res)
        const insertedCount = res.insertedCount;
        console.log("inserted "+insertedCount+" document(s) in database.");
      })
    }
  }
//alles andere
mqttclient.on('connect', function () {
    mqttclient.subscribe('/sweavs/hanna/moisture', function (err) {
    if (!err) {
        console.log("Verbunden mit Mqtt");
         } 
  })
})
dbclient.connect(err => {
    console.log(err)
    console.log("Verbunden mit dem TerrariumDB");
    db = dbclient.db("terrariumdaten");
    data = db.collection("Messung");
    mqttclient.on('message', function (topic, message) {
        // message is Buffer
        //console.log(message.toString());
        saveData(message);
    })
})

app.get('/api/latest', (req, res)=>{
  data.find({}).sort({'createdat': -1}).limit(1).next()
  .then(async(latest)=>{
    res.send(latest)
  })
});
app.get('/api/chart', (req, res)=>{
  data.find({}).sort({'createdat': -1}).limit(30).toArray()
  .then(async(latest)=>{
    res.send(latest)
  })
})
