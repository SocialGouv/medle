import cors from "micro-cors"
import nextConnect from "next-connect"

import knex from "../../knex/knex"
import { compareWithHash } from "../../utils/bcrypt"
import { generateToken } from "../../utils/jwt"
import {
   STATUS_400_BAD_REQUEST,
   STATUS_401_UNAUTHORIZED,
   STATUS_405_METHOD_NOT_ALLOWED,
   METHOD_OPTIONS,
   METHOD_POST,
} from "../../utils/http"
import { createError, sendError, sendSuccess } from "../../utils/api"
import { timeout } from "../../config"
import { logError } from "../../utils/logger"
import { transform } from "../../models/user"

const validPassword = password => password.length

function onError(err, req, res) {
   sendError(req, res, err)
}

function onNoMatch(req, res) {
   logError("req", req)
   return sendError(req, res, createError(STATUS_405_METHOD_NOT_ALLOWED, "Method not allowed"))
}

const handler = nextConnect({ onError, onNoMatch })

const handleOptionsMethod = (req, res, next) => {
   if (req.method === METHOD_OPTIONS) res.end()
   else next()
}

const handleCORS = (req, res, next) => {
   cors({ allowMethods: [METHOD_POST, METHOD_OPTIONS] })(req, res)
   next()
}

handler
   .use(handleCORS)
   .use(handleOptionsMethod)
   .post(async (req, res) => {
      res.setHeader("Content-Type", "application/json")

      try {
         // request verification
         const { email, password } = await req.body

         if (!validPassword(password)) {
            return res.status(STATUS_400_BAD_REQUEST).json({ message: "Incorrect password" })
         }

         // SQL query
         const [dbUser] = await knex("users")
            .leftJoin("hospitals", "users.hospital_id", "hospitals.id")
            .where("email", email)
            .whereNull("users.deleted_at")
            .select(
               "users.id",
               "users.first_name",
               "users.last_name",
               "users.email",
               "users.password",
               "users.role",
               "users.hospital_id",
               "hospitals.name as hospital_name",
               "users.scope",
            )

         if (dbUser && (await compareWithHash(password, dbUser.password))) {
            const user = transform(dbUser)
            const token = generateToken(user)

            res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly; Max-Age=${timeout.cookie}`)

            return sendSuccess(req, res).json(user)
         } else {
            // Unauthorized path
            return res.status(STATUS_401_UNAUTHORIZED).json({
               error: {
                  message: "Erreur d'authentification",
               },
            })
         }
      } catch (error) {
         // 5 DB error
         return sendError(req, res, error)
      }
   })

export default handler
