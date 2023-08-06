import { db } from "../database/database.connection.js"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"

export async function signUp(req, res) {
    const { name, email, password } = req.body

    try {
        const userExiste = await db.query(`SELECT * FROM users WHERE email=$1;`, [email])
        if (userExiste.rowCount == !0) return res.sendStatus(409)

        const hash = bcrypt.hashSync(password, 10)
        await db.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3);`,
            [name, email, hash]
        )
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function signIn(req, res) {
    const { email, password } = req.body

    try {
        const userExiste = await db.query(`SELECT * FROM users WHERE email=$1;`, [email])
        if (userExiste.rowCount === 0) return res.sendStatus(401)

        const correctPassword = bcrypt.compareSync(password, userExiste.rows[0].password)
        if (!correctPassword) return res.sendStatus(401)

        const token = uuid()
        await db.query(`INSERT INTO session ("userId", token) VALUES ($1, $2);`,
            [userExiste.rows[0].id, token]
        )

        res.status(200).send({ token })
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function getUsers(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.sendStatus(401)

    try {
        const session = await db.query(`SELECT * FROM session WHERE token=$1;`, [token])
        if (session.rowCount === 0) return res.sendStatus(401)

        const user = await db.query(`SELECT * FROM users WHERE id=$1;`, [session.rows[0].userId])
        if (user.rowCount[0] === 0) return res.sendStatus(401)

        const visitsResult = await db.query(
            `SELECT SUM(url."visitCount") FROM url WHERE "userId"=$1;`,
            [user.rows[0].id]
        )

        const visitSum = visitsResult.rows[0].sum || 0;

        const urls = await db.query(`SELECT * FROM url WHERE "userId"=$1;`, [user.rows[0].id])

        const shortenedUrls = urls.rows.map((item) => {
            return {
                id: item.id,
                shortUrl: item.shortUrl,
                url: item.url,
                visitCount: item.visitCount
            }
        })

        const result = {
            id: user.rows[0].id,
            name: user.rows[0].name,
            visitCount: visitSum,
            shortenedUrls
        }

        res.status(200).send(result)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function getRanking(req, res) {
    try {
        const ranking = await db.query(`
        SELECT users.id, users.name, COUNT(url.id) "linksCount", 
        COALESCE(SUM(url."visitCount"), 0) AS "visitCount" 
        FROM users 
        LEFT JOIN url ON users.id = url."userId" 
        GROUP BY users.id, users.name 
        ORDER BY "visitCount" DESC, "linksCount" DESC 
        LIMIT 10;`)

        res.send(ranking.rows)

    } catch (err) {
        res.status(500).send(err.message)
    }
}