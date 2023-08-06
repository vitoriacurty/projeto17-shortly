import { Router } from "express"
import { getRanking, getUsers, signIn, signUp } from "../controllers/user.controllers.js"
import { schemaValidation } from "../middlewares/schemaValidation.middleware.js"
import { loginSchema, userSchema } from "../schemas/schemas.js"


const userRouter = Router()

userRouter.post("/signup", schemaValidation(userSchema), signUp)
userRouter.post("/signin", schemaValidation(loginSchema), signIn)
userRouter.get("/users/me", getUsers)
userRouter.get("/ranking", getRanking)

export default userRouter