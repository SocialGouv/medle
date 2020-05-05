import { findAllAttacks } from "../clients/attacks"
import { findAllHospitals } from "../clients/hospitals"
import { logInfo } from "../utils/logger"

export const fetchReferenceData = async () => {
  logInfo("Récupération des libellés des données de référence")
  const attacks = await findAllAttacks()
  const hospitals = await findAllHospitals()

  sessionStorage.setItem("attacks", JSON.stringify(attacks))
  sessionStorage.setItem("hospitals", JSON.stringify(hospitals))
}

export const clearReferenceData = () => {
  sessionStorage.removeItem("attacks")
}

export const getReferenceData = (key) => {
  if (typeof sessionStorage !== "undefined") {
    return sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)) : []
  }
  return []
}
