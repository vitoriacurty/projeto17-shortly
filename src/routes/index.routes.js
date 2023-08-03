import { Router } from "express";
import urlRouter from "./url.routes.js";
import userRouter from "./user.routes.js";

const router = Router()

router.use(userRouter)
router.use(urlRouter)

export default router