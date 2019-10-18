import knex from "../../../lib/knex/knexfile"

export default async (req, res) => {
   let types

   try {
      types = await knex("acte").select("*")
   } catch (err) {
      return res.status(500).json({ message: `Erreur de base de donnée / ${err}` })
   }

   if (types) {
      return res.status(200).json({ actes: types })
   } else {
      return res.status(404).end("")
   }
}
