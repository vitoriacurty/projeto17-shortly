import { Router } from "express"
import { signIn, signUp } from "../controllers/user.controllers.js"
import { schemaValidation } from "../middlewares/schemaValidation.middleware.js"
import { loginSchema, userSchema } from "../schemas/schemas.js"


const userRouter = Router()

userRouter.post("/signup", schemaValidation(userSchema), signUp)
userRouter.post("/signin", schemaValidation(loginSchema), signIn)
userRouter.get("/users/me")
userRouter.get("/ranking")

export default userRouter