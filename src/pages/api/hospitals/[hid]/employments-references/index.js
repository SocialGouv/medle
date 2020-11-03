import Cors from "micro-cors"

import { STATUS_200_OK, METHOD_GET, METHOD_POST, METHOD_OPTIONS } from "../../../../../utils/http"
import { ADMIN, EMPLOYMENT_CONSULTATION } from "../../../../../utils/roles"
import { sendAPIError, sendMethodNotAllowedError } from "../../../../../services/errorHelpers"
import { checkValidUserWithPrivilege } from "../../../../../utils/auth"
import { findAll, create, searchByMonth } from "../../../../../services/employments-references"

const handler = async (req, res) => {
  res.setHeader("Content-Type", "application/json")

  const { type, hid } = req.query

  try {
    switch (req.method) {
      case METHOD_GET: {
        checkValidUserWithPrivilege(ADMIN, req, res)

        const references = await findAll({ hid })

        return res.status(STATUS_200_OK).json(references)
      }
      case METHOD_POST: {
        if (type === "searchByMonth") {
          checkValidUserWithPrivilege(EMPLOYMENT_CONSULTATION, req, res)

          const references = await searchByMonth({ hid }, req.body)

          return res.status(STATUS_200_OK).json(references)
        } else {
          checkValidUserWithPrivilege(ADMIN, req, res)

          const id = await create(req.body)

          return res.status(STATUS_200_OK).json({ id })
        }
      }
      default:
        if (req.method !== METHOD_OPTIONS) return sendMethodNotAllowedError(res)
    }
  } catch (error) {
    sendAPIError(error, res)
  }
}

const cors = Cors({
  allowMethods: [METHOD_GET, METHOD_POST, METHOD_OPTIONS],
})

export default cors(handler)
