import Cors from "micro-cors"

import { sendAPIError, sendMethodNotAllowedError } from "../../../../services/errorHelpers"
import { buildLivingStatistics } from "../../../../services/statistics/living"
import { checkValidUserWithPrivilege } from "../../../../utils/auth"
import { METHOD_OPTIONS, METHOD_POST, STATUS_200_OK } from "../../../../utils/http"
import { STATS_GLOBAL } from "../../../../utils/roles"

const handler = async (req, res) => {
  res.setHeader("Content-Type", "application/json")

  try {
    switch (req.method) {
      case METHOD_POST: {
        const currentUser = checkValidUserWithPrivilege(STATS_GLOBAL, req, res)

        const {
          inputs,
          globalCount,
          averageCount,
          actsWithPv,
          actTypes,
          hours,
          examinations,
        } = await buildLivingStatistics(req.body, currentUser)

        return res.status(STATUS_200_OK).json({
          inputs,
          globalCount,
          averageCount,
          actsWithPv,
          actTypes,
          hours,
          examinations,
        })
      }
      default:
        if (req.method !== METHOD_OPTIONS) return sendMethodNotAllowedError(res)
    }
  } catch (error) {
    sendAPIError(error, res)
  }
}

const cors = Cors({
  allowMethods: [METHOD_POST, METHOD_OPTIONS],
})

export default cors(handler)
