import knex from "../../knex/knex"
import { STATUS_200_OK, STATUS_400_BAD_REQUEST, STATUS_500_INTERNAL_SERVER_ERROR } from "../../utils/http"
import { ADMIN } from "../../utils/roles"
import { sendAPIError } from "../../services/errorHelpers"
import { checkValidUserWithPrivilege } from "../../utils/auth"
import { APIError } from "../../utils/errors"
import { transformAll } from "../../models/user"
import { makeWhereClause } from "./common"
import { buildScope } from "../scope"

export const create = async (req, res) => {
   const { id } = req.query

   try {
      // privilege verification
      const currentUser = checkValidUserWithPrivilege(ADMIN, req, res)

      if (!id || isNaN(id)) {
         return res.status(STATUS_400_BAD_REQUEST).end()
      }

      const scope = buildScope(currentUser)

      try {
         // SQL query
         const [user] = await knex("users")
            .leftJoin("hospitals", "users.hospital_id", "hospitals.id")
            .where("id", id)
            .where(makeWhereClause({ scope }))
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

         return res.status(STATUS_200_OK).json({ user: transformAll(user) })
      } catch (error) {
         throw new APIError({
            status: STATUS_500_INTERNAL_SERVER_ERROR,
            message: "Erreur DB",
            detail: error.message,
         })
      }
   } catch (error) {
      // DB error
      sendAPIError(error, res)
   }
}
