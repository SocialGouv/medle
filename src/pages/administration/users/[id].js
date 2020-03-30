import React, { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import PropTypes from "prop-types"
import fetch from "isomorphic-unfetch"
import {
   Button,
   Col,
   Row,
   Alert,
   Container,
   Form,
   FormFeedback,
   FormGroup,
   Input,
   Label,
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
} from "reactstrap"
import EditOutlinedIcon from "@material-ui/icons/EditOutlined"
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined"
import AsyncSelect from "react-select/async"

import PeopleIcon from "../../../components/icons/people"

import { FORMAT_DATE } from "../../../utils/date"
import { API_URL, ADMIN_USERS_ENDPOINT, HOSPITALS_ENDPOINT } from "../../../config"
import Layout from "../../../components/LayoutAdmin"
import ColumnAct from "../../../components/ColumnAct"
import { Title1, Title2 } from "../../../components/StyledComponents"
import { isEmpty } from "../../../utils/misc"
import { handleAPIResponse } from "../../../utils/errors"
import { buildAuthHeaders, redirectIfUnauthorized, withAuthentication } from "../../../utils/auth"
import { isAllowed, ADMIN, ROLES, ROLES_DESCRIPTION } from "../../../utils/roles"
import { logError } from "../../../utils/logger"
import { profiles } from "../../../utils/actsConstants"

const fetchHospitals = async value => {
   const bonus = value ? `?fuzzy=${value}` : ""

   let json
   try {
      const response = await fetch(`${API_URL}${HOSPITALS_ENDPOINT}${bonus}`)
      json = await handleAPIResponse(response)
   } catch (error) {
      logError(error)
   }
   return isEmpty(json) ? [] : json
}

const UserDetail = ({ initialUser, currentUser }) => {
   const [user, setUser] = useState(initialUser)

   const onChange = e => {
      dispatch({ type: "askerId", payload: { val: (e && e.value) || null } })
   }

   return (
      <Layout currentUser={currentUser}>
         <Container style={{ maxWidth: 720 }} className="mt-5 mb-4">
            <Title1 className="mb-5">{"Utilisateur"}</Title1>

            <Form>
               <FormGroup row>
                  <Label for="id" sm={3}>
                     Id
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="id" id="id" disabled />
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="firstName" sm={3}>
                     Prénom
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="firstName" id="firstName" />
                     <FormFeedback>Erreur sur le prénom</FormFeedback>
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="lastName" sm={3}>
                     Nom
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="lastName" id="lastName" />
                     <FormFeedback>Erreur sur le nom</FormFeedback>
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="email" sm={3}>
                     Courriel
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="email" id="email" />
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="pwd" sm={3}>
                     Mot de passe
                  </Label>
                  <Col sm={9}>
                     <Input type="password" name="pwd" id="pwd" />
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="role" sm={3}>
                     Rôle
                  </Label>
                  <Col sm={9}>
                     <Input type="select" name="role" id="role">
                        {Object.keys(ROLES).map(key => (
                           <option key={key}>{ROLES_DESCRIPTION[key]}</option>
                        ))}
                     </Input>
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="hospital" sm={3}>
                     {"Établissement d'appartenance"}
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="hospital" id="hospital" />
                     {/* <AsyncSelect
                        defaultOptions={previousValues}
                        loadOptions={fetchHospitals}
                        isClearable={true}
                        placeholder="Tapez le nom du demandeur"
                        noOptionsMessage={() => "Aucun résultat"}
                        loadingMessage={() => "Chargement..."}
                        onChange={onChange}
                        isDisabled={disabled}
                        value={existingValue}
                     /> */}
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="scope" sm={3}>
                     Établissements accessibles
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="scope" id="scope" />
                  </Col>
               </FormGroup>
               <div className="d-flex justify-content-end">
                  <Button className="px-4 mt-3">Modifier</Button>
               </div>
            </Form>
         </Container>
      </Layout>
   )
}

UserDetail.getInitialProps = async ctx => {
   const authHeaders = buildAuthHeaders(ctx)

   const { id } = ctx.query

   try {
      const response = await fetch(API_URL + ADMIN_USERS_ENDPOINT + "/" + id, { headers: authHeaders })
      const user = await handleAPIResponse(response)
      return { initialUser: user }
   } catch (error) {
      logError(error)
      redirectIfUnauthorized(error, ctx)

      return { error: "Erreur serveur" }
   }
}

UserDetail.propTypes = {
   initialUser: PropTypes.object,
   currentUser: PropTypes.object.isRequired,
}

export default withAuthentication(UserDetail, ADMIN)
