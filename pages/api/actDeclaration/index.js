import {
   STATUS_200_OK,
   STATUS_405_METHOD_NOT_ALLOWED,
   STATUS_500_INTERNAL_SERVER_ERROR,
} from "../../../utils/HttpStatus"
import knex from "../../../lib/knex/knex"

const getDataActs = data => ({
   internal_number: data.internalNumber,
   pv_number: data.pvNumber,
   examination_date: data.examinationDate,
   asker_id: 1, // TODO récupérer l'id
   profile: data.profile,

   extra_data: {
      personGender: data.personGender,
      personAgeTag: data.personAgeTag,
      examinationTypes: data.examinationTypes,
      violenceTypes: data.violenceTypes,
      examinationDatePeriod: data.periodOfDay,
      bloodExaminationNumber: data.bioExaminationsNumber,
      xrayExaminationNumber: data.imagingExaminationsNumber,
      othersExaminationNumber: data.othersExaminationNumber,
      multipleVisits: data.multipleVisits,
      location: data.location,
   },
})

export default async (req, res) => {
   res.setHeader("Content-Type", "application/json")

   if (req.method !== "POST") {
      console.error(`Méthode non permise ${STATUS_405_METHOD_NOT_ALLOWED}`)
      return res.status(STATUS_405_METHOD_NOT_ALLOWED).json({ message: "Méthode non permise" })
   }

   const data = await req.body

   knex("acts")
      .insert(getDataActs(data), "id")
      .then(ids => {
         return res.status(STATUS_200_OK).json({ message: `Déclaration envoyée`, detail: ids[0] })
      })
      .catch(error => {
         console.error(JSON.stringify(error))
         console.error(JSON.stringify(error))
         return res.status(STATUS_500_INTERNAL_SERVER_ERROR).json({
            error: `Erreur serveur base de données`,
            error_description: error,
            error_uri: "https://docs.postgresql.fr/8.3/errcodes-appendix.html",
         })
      })
}
