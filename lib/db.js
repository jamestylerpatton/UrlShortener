const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database(':memory:', err => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQlite database.");
    db.run(
      `CREATE TABLE urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url text UNIQUE,
            visits integer DEFAULT 0,
            CONSTRAINT url_unique UNIQUE (url)
            )`,
      err => {
        if (err) {
          // Table already created
        } else {
          // Table just created, creating some rows
          db.run("INSERT INTO urls (url) VALUES (?)", ["https://google.com"]);
        }
      }
    );
  }
});

module.exports = db;
