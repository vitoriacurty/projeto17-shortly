import { db } from "../database/database.connection.js"
import bcrypt from "bcrypt"

export async function signUp(req, res) {
    const { name, email, password } = req.body

    try {
        const userExiste = await db.query(`SELECT * FROM users WHERE email=$1;`, [email])
        if (userExiste.rowCount == !0) return res.sendStatus(409)

        const hash = bcrypt.hashSync(password, 10)
        await db.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3);`,
            [name, email, hash]
        )
    } catch (err) {
        res.status(500).send(err.message)
    }
    res.sendStatus(201)
}

export async function signIn(req, res) {

}