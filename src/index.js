const express = require("express");
const path = require("path");

const app = express();

// Serve static files
app.use("/", express.static(__dirname));

// Redirect /v/anything and /w/anything to ...
app.get("/v/*", (req, res) => {
  res.sendFile(path.join(__dirname, "vite-project/index.html"));
});
app.get("/w/*", (req, res) => {
  res.sendFile(path.join(__dirname, "vue-cli-project/index.html"));
});

app.get("/api", (req, res) => {
  res.json({ message: "some JSON" });
});

const port = 8080;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
