import knex from "../../knex/knex"
import { STATUS_200_OK, STATUS_400_BAD_REQUEST, STATUS_404_NOT_FOUND } from "../../utils/http"
import { ACT_MANAGEMENT } from "../../utils/roles"
import { sendAPIError } from "../../services/errorHelpers"
import { checkValidUserWithPrivilege } from "../../utils/auth"

export const del = async (req, res) => {
   try {
      // privilege verification
      checkValidUserWithPrivilege(ACT_MANAGEMENT, req, res)

      // request verification
      const { id } = req.query
      if (!id || isNaN(id)) {
         return res.status(STATUS_400_BAD_REQUEST).end()
      }

      // SQL query
      const [askers] = await knex("askers").where("id", id)

      if (askers) {
         return res.status(STATUS_200_OK).json(askers)
      } else {
         return res.status(STATUS_404_NOT_FOUND).end()
      }
   } catch (error) {
      // DB error
      sendAPIError(error, res)
   }
}
