const { secret } = require("./config.js")
const jwt = require("jsonwebtoken");

const Pool = require('pg').Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.IS_LOCAL ? undefined : { rejectUnauthorized : false },
})
const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUserById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUserByUsername = (username) => {
    return pool.query("SELECT * FROM users WHERE username = $1", [username])
        .then((results) => results.rows[0]);
}

const getAllTweets = (request, response) => {
    pool.query("SELECT tweets.id, tweets.message, tweets.created_at, users.username, users.name FROM tweets JOIN users ON tweets.user_id = users.id ORDER BY created_at DESC;", (error, results) => {
        if (error) {
            throw (error)
        }
        response.status(200).json(results.rows)
    })
}

const getAllTweetsByUsername = (request, response) => {
    const username = request.params.username
    pool.query("SELECT tweets.id, tweets.message, tweets.created_at, users.username, users.name FROM tweets JOIN users ON tweets.user_id = users.id WHERE users.username = $1 ORDER BY created_at DESC;", [username], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createUser = (request, response) => {
    const { name, email } = request.body

    pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`User added with ID: ${result.insertId}`)
    })
}

const createTweet = (request, response) => {
    const { message } = request.body
    const token = request.headers["x-auth-token"];
    console.log("TOKEN", token);

    if (!token) {
        response.status(401).send({ error: "Token missing" });
    }

    try {
        const payload = jwt.verify(token, Buffer.from(secret, "base64"));

        pool.query(
            "INSERT INTO tweets (user_id, message) VALUES ($1, $2) RETURNING *",
            [payload.id, message],
            (error, results) => {
                if (error) {
                    throw error;
                }
                response.status(201).send(`Tweet added with ID: ${results.rows[0].id}`);
            }
        );
    } catch (error) {
        console.log(error);
        response.status(401).send({ error: error.message });
    }
}


module.exports = {
    getUsers,
    getUserById,
    getAllTweets,
    getAllTweetsByUsername,
    getUserByUsername,
    createUser,
    createTweet,
}