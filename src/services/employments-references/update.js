import knex from "../../knex/knex"
import { untransform, validate } from "../../models/employments-references"

export const update = async (data) => {
  await validate(data)

  const { id } = data

  const number = await knex("employments_references").update(untransform(data)).where("id", id)

  return number
}
