import knex from "../../knex/knex"

export const makeWhereClause = ({ scope, fuzzy }) => builder => {
   builder.whereNull("users.deleted_at")
   if (scope && scope.length) {
      builder.where(knex.raw("hospital_id in (" + scope.map(() => "?").join(",") + ")", [...scope]))
   }

   if (fuzzy) {
      builder.where(function() {
         this.where("last_name", "ilike", `%${fuzzy}%`)
            .orWhere("first_name", "ilike", `%${fuzzy}%`)
            .orWhere("email", "ilike", `%${fuzzy}%`)
      })
   }
}

export const buildScope = currentUser => {
   if (!currentUser) return []
   let scope = currentUser.scope || []
   if (currentUser.hospital && currentUser.hospital.id) scope = [...scope, currentUser.hospital.id]
   return scope
}
