const express = require("express");
const bodyParser = require("body-parser");

const db = require("./lib/db");
const validateUrl = require("./lib/validateUrl");

const app = express();
const port = 3000;

base_url = process.env.BASE_URL || "http://localhost:3000";

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.set("views", "./views");
app.set("view engine", "pug");

app.get("/", (req, res) => {
  db.get("select * from urls", [], (err, rows) => {
    if (err) {
      res
        .status(500) // HTTP status 404: NotFound
        .render("error", { status: 500, message: "Something went wrong" });
    } else {
      res.render("index", { rows });
    }
  });
});

app.post("/", (req, res) => {
  let url = req.body.url;

  // Validate URL
  if (!validateUrl(url)) {
    res.render("index", { error: "URL is not valid", url: url });
  }

  // Check if url exists in db, if so return ID
  db.get("select * from urls where url = ?", [url], (err, result) => {
    if (err) {
      res
        .status(500) // HTTP status 404: NotFound
        .render("error", { status: 500, message: "Something went wrong" });
    } else if (result) {
      res.render("index", { shortUrl: base_url + "/" + result.id });
    } else {
      db.run("INSERT INTO urls (url) VALUES (?)", [url], function(err) {
        if (err) {
          res
            .status(500) // HTTP status 404: NotFound
            .render("error", { status: 500, message: "Something went wrong" });
        }

        res.render("index", { shortUrl: base_url + "/" + this.lastID });
      });
    }
  });
});

app.get("/:id", (req, res) => {
  db.get("select * from urls where id = ?", [req.params.id], (err, result) => {
    if (err || !result) {
      res
        .status(404) // HTTP status 404: NotFound
        .render("error", { status: 404, message: "URL Not Found" });
    } else {
      res.redirect(result.url);
    }
  });
});

app.listen(port, () => console.log(`URL Shortener listening on port ${port}!`));

// export app for testing
module.exports = app;