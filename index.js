const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
// verify JWT TOKEN
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

// database collection
const userCollection = client.db("QuatoCarsDb").collection("users");
const categoriesCollection = client.db("QuatoCarsDb").collection("categories");
const carsCollection = client.db("QuatoCarsDb").collection("carCollections");
const bookingCollection = client.db("QuatoCarsDb").collection("bookings");

// END POITNT
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

app.post("/categories", async (req, res) => {
  const category = req.body;
  const result = await carsCollection.insertOne(category);
  res.send(result);
});

app.post("/products", async (req, res) => {
  const category = req.body;
  const result = await carsCollection.insertOne(category);
  res.send(result);
});

app.get("/products", async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const result = await carsCollection.find(query).toArray();
  const productQuery = {};
  const allProduct = await carsCollection.find(productQuery).toArray();
  res.send({ data: { result, allProduct } });
});

app.delete("/products/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await carsCollection.deleteOne(query);
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
  res.send({ data: { result } });
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
  // const email = req.query.email;
  const filter = { profile: "Buyer" };
  const query = { profile: "Seller" };
  const buyers = await userCollection.find(filter).toArray();
  const users = await userCollection.find(query).toArray();
  res.send({
    data: { users, buyers },
  });
});

app.get("/users/buyer/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  res.send({
    isbuyer: user?.profile === "Buyer",
  });
});

app.get("/users/seller/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  res.send({
    isSeller: user?.profile === "Seller",
  });
});

app.get("/users/admin/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  res.send({
    isAdmin: user?.profile === "admin",
  });
});

app.delete("/users/admin/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await userCollection.deleteOne(query);
  res.send(result);
});

app.put("/users/admin/:id", verifyJWT, async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        userverfied: "Verified",
      },
    };
    const result = await userCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
  } catch (error) {
    console.log(error.name);
  }
});

// END POITNT

app.get("/", (req, res) => {
  res.send("Hello Im From Backend");
});
app.listen(port, () => {
  console.log(`Servr runnig on ${port}`);
});
