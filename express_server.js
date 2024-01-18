const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const { generateRandomString, emailTaken, userIdFromEmail, urlsForUser, userLoggedIn } = require("./helpers.js");
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'userRandomID' },
  "9sm5xK": { longURL: "http://www.google.com", userID: 'userRandomID' }
};
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

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['PROTECTIONICON'],
  maxAge: 24 * 60 * 60 * 1000,
}));

app.get("/", (req, res) => {
  if (userLoggedIn(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// main page & to show the user's urls
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});
//create new short url
app.get("/urls/new", (req, res) => {
  if (!userLoggedIn(req.session.user_id, users)) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});
//register route
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
//login route
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
app.get("/urls/:shortURL", (req, res) => {
  const userID = users[req.session.user_id];
  const user = users[req.session.user_id];
  if (!userID || !user) {
    res.status(403).send('please Log-in or Register to use the App!');
    return;
  }

  const shortURL = req.params.shortURL;
  const urlRecord = urlDatabase[req.params.shortURL].userID;
  if (!urlRecord) {
    res.send('this short URL does not exist!');
    return;
  }
  
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("This short url is not in the database.");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("This short URL does not correspond with a long URL.");
  }
});
//checks and registering a new user
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
//POST login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailTaken(email, users)) {
    res.status(403).send("There's no account associated with this email address");
  } else {
    const userID = userIdFromEmail(email, users);
    if (!bcrypt.compareSync(password, users[userID].password)) {
      req.session.user_id = userID;
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid password.");
    }
  }
});
//POST Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
// delete short urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("Unauthorized.");
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("Unauthorized.");
  }
});
//POST request response routes
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

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});