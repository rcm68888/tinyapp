const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  const { user_id: sessionUserID } = req.session;
  if (urlsForUser(sessionUserID, urlDatabase)) {
    const templateVars = {
      urls: urlsForUser(sessionUserID),
      user: users[sessionUserID],
    };
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_index", { urls: {}, user: "" });
  }
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});