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

export async function getUrlById(req, res) {
    const { id } = req.params
    try {
        const url = await db.query(`SELECT id, "shortUrl", url FROM url WHERE id=$1;`, [id])
        if (url.rowCount === 0) return res.sendStatus(404)

        res.status(200).send(url.rows[0])
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function openUrl(req, res) {
    const { shortUrl } = req.params
    try {
        const url = await db.query(`SELECT * FROM url WHERE "shortUrl"=$1;`, [shortUrl])
        if (url.rowCount === 0) return res.sendStatus(404)

        await db.query(
            `UPDATE url SET "visitCount" = "visitCount" + 1 
            WHERE id=$1;`, [url.rows[0].id])

        return res.redirect(url.rows[0].url)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function deleteUrl(req, res) {
    const { id } = req.params

    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    if (!token) return res.sendStatus(401)

    try {
        const session = await db.query(`SELECT * FROM session WHERE token=$1;`, [token])
        if (session.rowCount === 0) return res.sendStatus(401)

        //se a url nao existir, status 404
        const url = await db.query(`SELECT "userId" FROM url WHERE id=$1;`, [id])
        if (url.rowCount === 0) return res.sendStatus(404)
        //url encurtada não pertence ao usuário
        const user = await db.query(`SELECT * FROM users WHERE id=$1;`, [session.rows[0].userId])
        if (user.rowCount === 0) return res.sendStatus(401)
        //se a url for do usuário, status 204 e excluir a url encurtada
        await db.query(`DELETE FROM url WHERE id=$1;`, [id])

        res.sendStatus(204)
    } catch (err) {
        res.status(500).send(err.message)
    }
}