const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/scripts", (req, res) => {
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      res.status(500).send("Error reading scripts directory");
      return;
    }
    const scriptFiles = files.filter(
      (file) => file.endsWith(".js") && file !== "server.js"
    );
    res.json(scriptFiles);
  });
});

app.get("/api/run/:scriptName", (req, res) => {
  const scriptName = req.params.scriptName;
  const notLoggedInDays = req.query.notLoggedInDays || "0";
  const scriptPath = path.join(__dirname, scriptName);

  if (!fs.existsSync(scriptPath)) {
    return res.status(404).send("Script not found");
  }

  const env = { ...process.env, NOT_LOGGED_IN_DAYS: notLoggedInDays };
  const childProcess = spawn("node", [scriptPath], { env });

  let stdout = "";
  let stderr = "";

  childProcess.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  childProcess.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  childProcess.on("close", (code) => {
    if (code === 0) {
      res.send(stdout);
    } else {
      res.status(500).send(stderr);
    }
  });
});

app.use("/output", express.static(path.join(__dirname, "output")));

app.get("/api/output-files", (req, res) => {
  const outputDir = path.join(__dirname, "output");
  fs.readdir(outputDir, (err, files) => {
    if (err) {
      res.status(500).send("Error reading output directory");
      return;
    }
    const filteredFiles = files.filter((file) => file !== ".gitkeep");
    res.json(filteredFiles);
  });
});

app.get("/api/readme", (req, res) => {
  const readmePath = path.join(__dirname, "Readme.md");
  fs.readFile(readmePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading Readme.md");
      return;
    }
    res.send(marked(data));
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
