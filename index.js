const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("colors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.QuatoCarsDb}:${process.env.QuatoCarsPass}@cluster0.chgrg5k.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function dbConnect() {
  try {
    client.connect();
    console.log("database Connected");
  } catch (error) {
    console.log(error.message);
  }
}

dbConnect().catch((err) => console.log(err.message));

const userCollection = client.db("QuatoCarsDb").collection("users");

app.get("/jwt", async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  if (user) {
    const token = jwt.sign({ email }, process.env.access_token, {
      expiresIn: "365d",
    });
    return res.send({ accessToken: token });
  }
  return res.status(403).send({ accessToken: "Forbidden Access" });
});

app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    const result = await userCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    res.send(error.message);
  }
});
app.get("/users", async (req, res) => {
  try {
    const query = {};
    const result = await userCollection.find(query).toArray();
    res.send(result);
  } catch (error) {}
});
app.get("/", (req, res) => {
  res.send("I'm from backend");
});

app.listen(port, () => {
  console.log(`Servr runnig on ${port}`);
});
