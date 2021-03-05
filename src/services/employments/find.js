import knex from "../../knex/knex"
import { APIError } from "../../utils/errors"
import { STATUS_400_BAD_REQUEST } from "../../utils/http"
import { isValid } from "./common"

export const find = async ({ year, month, hospitalId }) => {
  if (!isValid({ hospitalId, month, year }))
    throw new APIError({
      message: "Bad request",
      status: STATUS_400_BAD_REQUEST,
    })

  const [results] = await knex("employments")
    .whereNull("deleted_at")
    .where("year", year)
    .where("month", month)
    .where("hospital_id", hospitalId)
    .select("data_month")

  return (results && results.data_month) || {}
}

export const findLastEdit = async (hospitalId) => {
  if (isNaN(hospitalId) || Number(hospitalId) < 1) {
    throw new APIError({
      message: "Bad request",
      status: STATUS_400_BAD_REQUEST,
    })
  }

  const [results] = await knex("employments")
    .where("hospital_id", hospitalId)
    .orderByRaw("year desc, month desc")
    .select(knex.raw("year, month, coalesce(updated_at, created_at) as lastupdated"))

  return results || {}
}
