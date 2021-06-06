let db, data;

//MONGO DB
//console.log(dbaccess);
const MongoClient = require('mongodb').MongoClient;
const config = require('./config');
dbaccess = config.dbaccess;
const uri = `mongodb+srv://${dbaccess.user}:${dbaccess.password}@${dbaccess.host}/${dbaccess.name}?retryWrites=true&w=majority`;
const dbClient = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
dbClient.connect(err => {
  if (err) {
    console.log(err);
  } else {
    console.log("connection to database established");
    db = dbClient.db("moistureTracking");
    db.createCollection("moistureData", function (err, res) {
      console.log("created collection 'moistureData'.");
    });
    data = db.collection("moistureData");
  }
});


//MQTT
const mqtt = require('mqtt');
mqttaccess = config.mqttaccess;
const {v4: uuidv4} = require('uuid');
const mqttClient = mqtt.connect(mqttaccess.host, {clientId: uuidv4()});

mqttClient.on('connect', function () {
  mqttClient.subscribe(mqttaccess.topic, function (err) {
    if (!err) {
      mqttClient.publish(mqttaccess.topic + "/logs", 'connected');
    }
  })
})

mqttClient.on('message', function (topic, message) {
  saveData(message);
});

function saveData(message) {
  let doc = JSON.parse(message);
  doc.createdAt = new Date();
  if (data) {
    data.insertOne(doc, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        res.send({
          action: "saveMoistureData",
          result: "success"
        });
      }
    });
  }
}


//EXPRESS
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
const port = 3001;
const cors = require('cors');
const corsOptions = {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
};
app.use(cors(corsOptions));

app.listen(port, () => {
  console.log(`sensor data service live @ http://localhost:${port}`);
});

app.get('/api/moistureData/:mac', (req, res) => {
  // get last 20 values of given mac address
  let mac = req.params.mac;
  if (data) {
    data.find({mac: mac}).sort({'createdAt': -1}).limit(20).toArray()
      .then(async (latest) => {
        res.send(latest);
      });
  }
});

app.get('/api/latest', (req, res) => {
  // get last document in the collection
  if (data) {
    data.find({}).sort({'createdAt': -1}).limit(1).next()
      .then(async (latest) => {
        res.send(latest);
      });
  }
});
