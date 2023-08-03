import Joi from "joi"

// schema login
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

// schema user
export const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required().valid(Joi.ref("password"))
})

// schema url
export const urlSchema = Joi.object({
    url: Joi.string().uri().required()
})