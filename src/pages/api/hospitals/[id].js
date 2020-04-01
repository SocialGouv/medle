import Cors from "micro-cors"

import knex from "../../../knex/knex"
import {
   STATUS_200_OK,
   STATUS_400_BAD_REQUEST,
   STATUS_404_NOT_FOUND,
   METHOD_GET,
   METHOD_OPTIONS,
} from "../../../utils/http"
import { NO_PRIVILEGE_REQUIRED } from "../../../utils/roles"
import { sendAPIError } from "../../../services/errorHelpers"
import { checkValidUserWithPrivilege } from "../../../utils/auth"

const handler = async (req, res) => {
   try {
      // privilege verification
      checkValidUserWithPrivilege(NO_PRIVILEGE_REQUIRED, req, res)

      // request verification
      const { id } = req.query

      if (!id || isNaN(id)) {
         return res.status(STATUS_400_BAD_REQUEST).end()
      }

      // SQL query
      const [hospital] = await knex("hospitals").where("id", id)

      if (hospital) {
         return res.status(STATUS_200_OK).json(hospital)
      } else {
         return res.status(STATUS_404_NOT_FOUND).end()
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