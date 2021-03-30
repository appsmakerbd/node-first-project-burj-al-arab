const express=require('express');
const app=express();


//cors for remote get and post request handling start
const cors = require('cors');
app.use(cors());
//cors for remote get and post request handling ends


//Mongo DB code for DB connect Start
const MongoClient = require('mongodb').MongoClient;
const ObjectId=require('mongodb').ObjectId;
const assert = require('assert');
//Mongo DB code for DB connect ends




//env config
require('dotenv').config();
//env config ends



// Mongo Connection URL
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jcglm.mongodb.net/burjAlArab?retryWrites=true&w=majority`;




//For firebase JWT admin authentication start
const admin = require('firebase-admin');
const serviceAccount = require("./configs/burj-al-arab-project3-firebase-adminsdk-fsutn-16ee288c18.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB

});
//For firebase JWT admin authentication end


//body parse for getting body json data through API start
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//body parse for getting body json data through API ends







app.get('/',(req,res)=>{
    res.send('Hello dear');
})


// Mongo Use connect method to connect to the Server
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookingCollection = client.db("burjAlArab").collection("bookings");
  console.log('Database connected');


  //Receiving Data from react Book.js
  app.post('/newBooking',(req,res)=>{
    console.log(req.body);
    bookingCollection.insertOne(req.body)
    .then(result=>{
      res.send(result.insertedCount>0);
    })
  })
 
  app.get('/allbookings',(req,res)=>{
    const urlEmail=req.query.email;
    const bearer=req.headers.authorization;
    //console.log(req.headers.authorization);
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken=bearer.split(' ')[1];
      // idToken comes from the client app
      admin.auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
         const tokenEmail = decodedToken.email;
        if(tokenEmail == urlEmail){
           console.log('token matched');
            //Getting Data from Database start
             const allData=bookingCollection.find({email:urlEmail})
            .toArray((error,documents)=>{
              res.status(200).send(documents);
            })
            //Getting Data from Database ends
         }else{
          console.log('Did not matched',tokenEmail,urlEmail);
          res.status(401).send('We Could not Access the Token!!');
         }
      })
      .catch((error) => {
        // Handle error
        //console.log(error);
      });
    }else{
      res.status(401).send('Un authorized access!!');
    }
    
    
  })

  //client.close();
});




//last line of the code
app.listen(5000);