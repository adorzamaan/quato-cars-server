const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("I'm from backend");
});

app.listen(port, () => {
  console.log(`Servr runnig on ${port}`);
});
