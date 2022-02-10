require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser')
const cors = require("cors");
const app = express()
const db = require('./queries')
const port = process.env.PORT;
const { secret } = require("./config.js")
const jwt = require("jsonwebtoken");

// console.log('PROCESS ENV', process.env);

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use(cors());

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.get('/tweets', db.getAllTweets)
app.get('/tweets/:username', db.getAllTweetsByUsername)
app.post('/users', db.createUser)
app.post('/tweets', db.createTweet)

app.post("/login", async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await db.getUserByUsername(username);

        if(!user) {
            return res
            .status(401)
            .send({ error: "Invalid username"})
        };

        if (password !== user.password) {
            return res
            .status(401)
            .send ({ error: "Wrong password"})
        };

        const token = jwt.sign({
            id: user.id,
            username: user.username,
            name: user.name,
        }, Buffer.from(secret, "base64"));

        res.send({ token });
    } catch (error) {
        res.status(500).send({ error: error.message});
    }
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})