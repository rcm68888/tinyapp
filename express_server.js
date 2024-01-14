const express = require("express");
const app = express();
const PORT = 8080;

const cookieSession = require("cookie-session");

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['THISISMYPROTECTION'],
  maxAge: 24 * 60 * 60 * 1000,
}));

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

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

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: /* What goes here? */ };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/register", (req, res) => {
  if (userLoggedIn(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (userLoggedIn(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("Unauthorized, please login or register to perform action.");
  }
});

app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;

  if (!newUserEmail || !newUserPassword) {
    res.status(400).send("Invalid credentials, you must enter an email address and a password.");
  } else if (emailTaken(newUserEmail, users)) {
    res.status(400).send("An account already exists for this email address");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: newUserEmail,
      password: bcrypt.hashSync(newUserPassword, 10),
    };
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});