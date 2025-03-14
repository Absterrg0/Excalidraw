import {z} from 'zod'




export const signInSchema = z.object({
    name:z.string(),
    password:z.string()
})


export const signUpSchema = z.object({

    name:z.string(),
    username:z.string(),
    password:z.string()
})

export const roomSchema = z.object({
    name:z.string()
})