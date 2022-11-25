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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Unauthorized Access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.access_token, function (err, decoded) {
    if (err) {
      res.status(403).send({ message: "Unauthorized Access" });
    }
    req.decoded = decoded;
    next();
  });
}

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
const categoriesCollection = client.db("QuatoCarsDb").collection("categories");
const carsCollection = client.db("QuatoCarsDb").collection("carCollections");
const bookingCollection = client.db("QuatoCarsDb").collection("bookings");

app.post("/bookings", async (req, res) => {
  const booking = req.body;
  const result = await bookingCollection.insertOne(booking);
  res.send(result);
});

app.get("/bookings", verifyJWT, async (req, res) => {
  const email = req.query.email;
  const decodedEmail = req.decoded.email;
  if (email !== decodedEmail) {
    return res.status(403).send({ message: "Forbidden Access" });
  }
  const query = { email: email };
  const result = await bookingCollection.find(query).toArray();
  res.send(result);
});

app.get("/categories", async (req, res) => {
  try {
    const query = {};
    const result = await categoriesCollection.find(query).toArray();
    res.send(result);
  } catch (error) {}
});

app.get("/categories/:id", async (req, res) => {
  const id = req.params.id;
  const query = { category_id: id };
  const result = await carsCollection.find(query).toArray();
  res.send(result);
});

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
