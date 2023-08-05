import { db } from "../database/database.connection.js"
import { nanoid } from "nanoid"

export async function createShortenUrl(req, res) {
    const { url } = req.body

    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.sendStatus(401)

    const shortUrl = nanoid(10)

    try {
        const session = await db.query(`SELECT * FROM session WHERE token=$1;`, [token])
        if (session.rowCount === 0) return res.sendStatus(401)

        const shortenUrl = await db.query(
            `INSERT INTO url (url, "shortUrl", "userId") 
            VALUES ($1, $2, $3) RETURNING id;`,
            [url, shortUrl, session.rows[0].userId])
        res.status(201).send({ "id": shortenUrl.rows[0].id, "shortUrl": shortUrl })
    } catch (err) {
        res.status(500).send(err.message)
    }
}