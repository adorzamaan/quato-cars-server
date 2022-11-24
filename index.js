const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
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

app.get("/", (req, res) => {
  res.send("I'm from backend");
});

app.listen(port, () => {
  console.log(`Servr runnig on ${port}`);
});
