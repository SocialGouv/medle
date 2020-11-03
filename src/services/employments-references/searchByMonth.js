import knex from "../../knex/knex"
import { APIError } from "../../utils/errors"
import { STATUS_400_BAD_REQUEST } from "../../utils/http"
import { transform } from "../../models/employments-references"

export const searchByMonth = async ({ hid }, { year, month }) => {
  if (!hid || !year || isNaN(year) || !month || isNaN(month))
    throw new APIError({
      status: STATUS_400_BAD_REQUEST,
      message: "Bad request",
    })

  const [reference] = await knex("employments_references")
    .whereNull("deleted_at")
    .where("hospital_id", hid)
    .where("year", year)
    .whereRaw("month::int >= ?", month)
    .orderBy([
      { column: "year", order: "desc" },
      { column: "month", order: "desc" },
    ])
    .select("id", "year", "month", "hospital_id", "reference")

  return reference ? transform(reference) : []
}
