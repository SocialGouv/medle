import React from "react"
import ActBlock from "./ActBlock"
import PropTypes from "prop-types"
import { Title2 } from "./StyledComponents"
import { Col, Row } from "reactstrap"
import Counter from "./Counter"
import { periodOfDayValues, getSituationDate } from "../utils/actsConstants"

const AsylumSeekerProfile = ({ dispatch, state, examinationDate, errors }) => {
   const situationDate = getSituationDate(examinationDate)
   const periods = periodOfDayValues[situationDate].period.map(elt => ({ title: elt.title, subTitle: elt.subTitle }))

   return (
      <>
         <ActBlock
            type="examinationTypes"
            title="Type(s) d'examen"
            values={["Somatique"]}
            mode="toggle"
            dispatch={dispatch}
            state={state.examinationTypes || []}
            invalid={errors.examinationTypes}
         />
         <Title2 className="mb-4 mt-5">{"Examens complémentaires"}</Title2>
         <Row>
            <Col>
               <Counter dispatch={dispatch} state={state} type={"bioExaminationsNumber"}>
                  Biologiques
               </Counter>
            </Col>
            <Col>
               <Counter dispatch={dispatch} state={state} type={"imagingExaminationsNumber"}>
                  Imagerie
               </Counter>
            </Col>
            <Col>
               <Counter dispatch={dispatch} state={state} type={"othersExaminationNumber"}>
                  Autres
               </Counter>
            </Col>
         </Row>

         <ActBlock
            type="periodOfDay"
            title="Heure de l'examen"
            values={periods}
            mode="toggle"
            dispatch={dispatch}
            state={state.periodOfDay || ""}
            invalid={errors.periodOfDay}
         />

         <Title2 className="mb-2 mt-5">{"Profil de la personne décédée"}</Title2>

         <ActBlock
            type="personGender"
            title=""
            subTitle="Genre"
            values={["Féminin", "Masculin", "Autre", "Non déterminé"]}
            mode="toggle"
            dispatch={dispatch}
            state={state.personGender || ""}
            invalid={errors.personGender}
         />
         <ActBlock
            type="personAgeTag"
            title=""
            subTitle="Âge"
            values={["Mineur", "Majeur", "Non déterminé"]}
            mode="toggle"
            dispatch={dispatch}
            state={state.personAgeTag || ""}
            invalid={errors.personAgeTag}
         />
      </>
   )
}

AsylumSeekerProfile.validate = state => {
   const errors = {}
   if (!state.examinationTypes.length) {
      errors.examinationTypes = "Obligatoire"
   }
   if (!state.periodOfDay) {
      errors.periodOfDay = "Obligatoire"
   }
   if (!state.personGender) {
      errors.personGender = "Obligatoire"
   }
   if (!state.personAgeTag) {
      errors.personAgeTag = "Obligatoire"
   }

   return errors
}

AsylumSeekerProfile.propTypes = {
   dispatch: PropTypes.func.isRequired,
   state: PropTypes.object.isRequired,
   examinationDate: PropTypes.string,
   errors: PropTypes.object,
}

export default AsylumSeekerProfile
