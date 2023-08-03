import { Router } from "express"


const userRouter = Router()

userRouter.post("/signup")
userRouter.post("/signin")
userRouter.get("/users/me")
userRouter.get("/ranking")

export default userRouter