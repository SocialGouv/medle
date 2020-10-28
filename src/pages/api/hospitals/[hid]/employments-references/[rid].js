import Cors from "micro-cors"

import { STATUS_200_OK, METHOD_GET, METHOD_PUT, METHOD_OPTIONS } from "../../../../../utils/http"
import { ADMIN } from "../../../../../utils/roles"
import { sendAPIError, sendMethodNotAllowedError } from "../../../../../services/errorHelpers"
import { checkValidUserWithPrivilege } from "../../../../../utils/auth"
import { find, update } from "../../../../../services/employments-references"

const handler = async (req, res) => {
  res.setHeader("Content-Type", "application/json")

  try {
    switch (req.method) {
      case METHOD_GET: {
        checkValidUserWithPrivilege(ADMIN, req, res)

        const references = await find(req.query)

        return res.status(STATUS_200_OK).json(references)
      }
      case METHOD_PUT: {
        checkValidUserWithPrivilege(ADMIN, req, res)

        const id = await update(req.body)

        return res.status(STATUS_200_OK).json({ id })
      }
      default:
        if (req.method !== METHOD_OPTIONS) return sendMethodNotAllowedError(res)
    }
  } catch (error) {
    sendAPIError(error, res)
  }
}

const cors = Cors({
  allowMethods: [METHOD_GET, METHOD_PUT, METHOD_OPTIONS],
})

export default cors(handler)
