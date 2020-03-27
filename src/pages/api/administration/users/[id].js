import Cors from "micro-cors"

import {
   STATUS_200_OK,
   METHOD_GET,
   METHOD_DELETE,
   METHOD_PUT,
   METHOD_POST,
   METHOD_OPTIONS,
} from "../../../../utils/http"
import { sendAPIError, sendMethodNotAllowedError, sendNotFoundError } from "../../../../services/errorHelpers"
import { ADMIN } from "../../../../utils/roles"
import { checkValidUserWithPrivilege } from "../../../../utils/auth"

import { find } from "../../../../services/users/find"
import { del } from "../../../../services/users/delete"
import { update } from "../../../../services/users/update"
import { create } from "../../../../services/users/create"

const handler = async (req, res) => {
   res.setHeader("Content-Type", "application/json")

   try {
      switch (req.method) {
         case METHOD_GET: {
            const currentUser = checkValidUserWithPrivilege(ADMIN, req, res)

            const user = await find({ ...req.query, currentUser })

            if (!user) return sendNotFoundError(res)

            return res.status(STATUS_200_OK).json(user)
         }
         case METHOD_DELETE:
            del(req, res)
            break
         case METHOD_PUT:
            update(req, res)
            break
         case METHOD_POST:
            create(req, res)
            break
         default:
            return sendMethodNotAllowedError(res)
      }
   } catch (error) {
      return sendAPIError(error, res)
   }
}

const cors = Cors({
   allowMethods: [METHOD_GET, METHOD_OPTIONS],
})

export default cors(handler)
