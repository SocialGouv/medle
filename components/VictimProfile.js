import React from "react"
import ActBlock from "./ActBlock"
import PropTypes from "prop-types"
import { Title2 } from "./StyledComponents"
import { Col, Row } from "reactstrap"
import Counter from "./Counter"
import { periodOfDayValues, getSituationDate } from "../utils/actsConstants"

const VictimProfile = ({ dispatch, state, examinationDate }) => {
   const situationDate = getSituationDate(examinationDate)
   const periods = periodOfDayValues[situationDate].period.map(elt => ({ title: elt.title, subTitle: elt.subTitle }))

   return (
      <>
         <ActBlock
            type="examinationTypes"
            title="Type(s) d'examen"
            values={["Somatique", "Psychiatrique", "Psychologique"]}
            mode="toggleMultiple"
            dispatch={dispatch}
            state={state.examinationTypes || []}
         />
         <ActBlock
            type="violenceTypes"
            title="Type(s) de violence"
            values={[
               "Conjugale",
               "Urbaine",
               "En réunion",
               "Scolaire",
               "Familiale",
               "Sur ascendant",
               "Agression sexuelle",
               { title: "Attentat", subValues: ["Bataclan", "Hyper Cacher"] },
            ]}
            mode="toggleMultiple"
            dispatch={dispatch}
            state={state.violenceTypes || []}
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
                  Imageries
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
         />
         <ActBlock
            type="personGender"
            title=""
            subTitle="Genre"
            values={["Féminin", "Masculin", "Autre"]}
            mode="toggle"
            dispatch={dispatch}
            state={state.personGender || ""}
         />
         <ActBlock
            type="personAgeTag"
            title=""
            subTtle="Âge"
            values={["0-2 ans", "3-17 ans", "+ de 18 ans"]}
            mode="toggle"
            dispatch={dispatch}
            state={state.personAgeTag || ""}
         />
      </>
   )
}

VictimProfile.propTypes = {
   dispatch: PropTypes.func.isRequired,
   state: PropTypes.object.isRequired,
   examinationDate: PropTypes.string,
}

export default VictimProfile
