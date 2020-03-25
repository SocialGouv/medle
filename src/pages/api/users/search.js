import Cors from "micro-cors"

import { STATUS_200_OK, STATUS_500_INTERNAL_SERVER_ERROR, METHOD_GET, METHOD_OPTIONS } from "../../../utils/http"
import knex from "../../../knex/knex"
import { sendAPIError } from "../../../utils/api"
import { checkValidUserWithPrivilege } from "../../../utils/auth"
import { ADMIN } from "../../../utils/roles"
import { APIError } from "../../../utils/errors"
import { transformAll } from "../../../models/user"

const LIMIT = 100

const makeWhereClause = ({ scope, fuzzy }) => builder => {
   builder.whereNull("users.deleted_at")
   if (scope && scope.length) {
      builder.where(knex.raw("hospital_id in (" + scope.map(() => "?").join(",") + ")", [...scope]))
   }

   if (fuzzy) {
      builder.where(function() {
         this.where("last_name", "ilike", `%${fuzzy}%`)
            .orWhere("first_name", "ilike", `%${fuzzy}%`)
            .orWhere("email", "ilike", `%${fuzzy}%`)
      })
   }
}

const handler = async (req, res) => {
   res.setHeader("Content-Type", "application/json")

   try {
      // privilege verification
      const currentUser = checkValidUserWithPrivilege(ADMIN, req, res)

      console.log("currentUser.hospitalId", currentUser.hospitalId, currentUser.hospitalId === null)
      let scope = currentUser.scope || []

      if (currentUser.hospitalId) {
         scope = [...scope, currentUser.hospitalId]
      }

      const { fuzzy } = req.query

      console.log("scope", scope)
      console.log("fuzzy", fuzzy)

      let requestedPage =
         req.query.requestedPage && !isNaN(req.query.requestedPage) && parseInt(req.query.requestedPage)

      try {
         const [usersCount] = await knex("users")
            .where(makeWhereClause({ scope, fuzzy }))
            .count()

         const totalCount = parseInt(usersCount.count)
         const maxPage = Math.ceil(totalCount / LIMIT)

         // set default to 1 if not correct or too little, set default to maxPage if too big
         requestedPage =
            !requestedPage || isNaN(requestedPage) || requestedPage < 1
               ? 1
               : requestedPage > maxPage
               ? maxPage
               : requestedPage

         const offset = (requestedPage - 1) * LIMIT

         // SQL query
         const users = await knex("users")
            .leftJoin("hospitals", "users.hospital_id", "hospitals.id")
            .where(makeWhereClause({ scope, fuzzy }))
            .whereNull("users.deleted_at")
            .orderBy("hospital_id", "last_name", "first_name")
            .limit(LIMIT)
            .offset(offset)
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

         return res
            .status(STATUS_200_OK)
            .json({ totalCount, currentPage: requestedPage, maxPage, byPage: LIMIT, elements: transformAll(users) })
      } catch (error) {
         throw new APIError({
            status: STATUS_500_INTERNAL_SERVER_ERROR,
            message: "Erreur DB",
            detailMessage: error.message,
            uri: "https://docs.postgresql.fr/8.3/errcodes-appendix.html",
         })
      }
   } catch (error) {
      // DB error
      sendAPIError(error, res)
   }
}

const cors = Cors({
   allowMethods: [METHOD_GET, METHOD_OPTIONS],
})

export default cors(handler)
