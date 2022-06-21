//Cordova Project
//allows server hosting using express js
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

//Connects to MongoDB cloud
var charactersCollection;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ifteshawn:Qawsed_z12@cluster0.sjnsj.mongodb.net/MWA_Assign2?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
  charactersCollection = client.db("MWA_Assign2").collection("charactersCollection");
  console.log("Database connection up!");
//   client.close();
});


app.get("/", (req, res) => {
    res.send("Hello from root!")
});

//Deletes all documents in the cloud
app.get("/delCloudData", (req, res) => {
    charactersCollection.deleteMany(req.body, function(err, result) {
        if(err) {
            console.log(err);
        } else {
            console.log({"msg" : "All Characters Deleted:"});
            res.send({"msg" : "All Characters Deleted:"});
        }
    });
});

//to retrieve all data from the cloud
app.get("/getCloudData", function(req, res) {
    console.log(" In getCloudData");
    charactersCollection.find({}, {projection:{_id:0}}).toArray(function(err, docs) {
        if (err) {
            console.log("Error!: " + err);
            res.send("Error!: " + err);
        } else {
            console.log(docs.length + " Documents retrieved");
            res.send(docs);
        }
    });
});

//to post QR code data into the cloud DB.
app.post("/postData", (req, res) => {
    charactersCollection.insertMany([req.body], function(err, result) {
        if(err) {
            console.log(err);
        } else {
            console.log({"msg" : result.insertedCount + " Characters Inserted:"});
            res.send({"msg" : result.insertedCount + " Characters Inserted:"});
        }
    });
});

//Enables the server to listed in incoming requests on port 3000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})