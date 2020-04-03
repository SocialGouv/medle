import knex from "../../knex/knex"
import { STATUS_401_UNAUTHORIZED } from "../../utils/http"
import { SUPER_ADMIN } from "../../utils/roles"
import { APIError } from "../../utils/errors"
import { untransform, validate } from "../../models/users"

export const create = async (data, currentUser) => {
   await validate(data)

   if (currentUser.role !== SUPER_ADMIN) {
      if (!data.hospital || !data.hospital.id || !currentUser.hospital || !currentUser.hospital.id)
         throw new APIError({
            status: STATUS_401_UNAUTHORIZED,
            message: "Not authorized",
         })

      if (data.hospital.id !== currentUser.hospital.id) {
         throw new APIError({
            status: STATUS_401_UNAUTHORIZED,
            message: "Not authorized",
         })
      }
   }

   const [id] = await knex("users").insert(untransform(data), "id")

   return id
}
