import { Router } from "express"
import { createShortenUrl, deleteUrl, getUrlById, openUrl } from "../controllers/url.controllers.js"
import { schemaValidation } from "../middlewares/schemaValidation.middleware.js"
import { urlSchema } from "../schemas/schemas.js"

const urlRouter = Router()

urlRouter.post("/urls/shorten", schemaValidation(urlSchema) ,createShortenUrl)
urlRouter.get("/urls/:id", getUrlById)
urlRouter.get("/urls/open/:shortUrl", openUrl)
urlRouter.delete("/urls/:id", deleteUrl)

export default urlRouter 