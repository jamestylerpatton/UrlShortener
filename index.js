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

/**
 * GET Home route
 */
app.get("/", (req, res) => {
  db.all("SELECT * FROM urls", [], (err, rows) => {
    if (err) {
      res
        .status(500)
        .render("error", { status: 500, message: "Something went wrong" });
    } else {
      res.render("index", { rows });

      rows.forEach(item => {
        console.log(item.id + ' : ' + item.url + ' : ' + item.visits)
      })
    }
  });
});

/**
 * POST to Home route
 */
app.post("/", (req, res) => {
  let url = req.body.url;

  // Validate URL
  if (!validateUrl(url)) {
    res.render("index", { error: "URL is not valid", url: url });
  }

  // Check if url exists in db
  db.get("SELECT * FROM urls WHERE url = ?", [url], (err, result) => {
    if (err) {
      res
        .status(500)
        .render("error", { status: 500, message: "Something went wrong" });
    } else if (result) {
      // URL already exists in DB, return id from row
      res.render("index", { shortUrl: base_url + "/" + result.id });
    } else {
      // Create a new record with new URL
      db.run("INSERT INTO urls (url) VALUES (?)", [url], function(err) {
        if (err) {
          res
            .status(500)
            .render("error", { status: 500, message: "Something went wrong" });
        }

        res.render("index", { shortUrl: base_url + "/" + this.lastID });
      });
    }
  });
});

app.get("/:id", (req, res) => {
  db.get("SELECT * FROM urls WHERE id = ?", [req.params.id], (err, result) => {
    if (err || !result) {
      res
        .status(404)
        .render("error", { status: 404, message: "URL Not Found" });
    } else {
      db.run(
        "UPDATE urls SET visits = visits + 1 WHERE id = ?",
        [result.id],
        function(err) {
          if (err) {
            console.error('Something went wrong');
          }
        }
      );

      res.redirect(result.url);
    }
  });
});

app.listen(port, () => console.log(`URL Shortener listening on port ${port}!`));

// export app for testing
module.exports = app;