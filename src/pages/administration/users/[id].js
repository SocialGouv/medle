import React, { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import PropTypes from "prop-types"
import fetch from "isomorphic-unfetch"
import {
   Button,
   Col,
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
import { useForm } from "react-hook-form"

import { API_URL, ADMIN_USERS_ENDPOINT, HOSPITALS_ENDPOINT } from "../../../config"
import Layout from "../../../components/LayoutAdmin"
import { Title1, Title2 } from "../../../components/StyledComponents"
import { isEmpty } from "../../../utils/misc"
import { handleAPIResponse } from "../../../utils/errors"
import { buildAuthHeaders, redirectIfUnauthorized, withAuthentication } from "../../../utils/auth"
import { METHOD_DELETE } from "../../../utils/http"
import { ADMIN, ROLES, ROLES_DESCRIPTION } from "../../../utils/roles"
import { logError } from "../../../utils/logger"

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

const MandatorySign = () => <span style={{ color: "red" }}>*</span>

const UserDetail = ({ initialUser = {}, currentUser }) => {
   const router = useRouter()
   const { id } = router.query
   const { handleSubmit, register, errors } = useForm()

   const [user, setUser] = useState(initialUser)
   const [error, setError] = useState("")
   const [modal, setModal] = useState(false)
   const toggle = () => setModal(!modal)

   const onChange = e => {
      const { id, value } = e.target
      setUser(user => ({
         ...user,
         [id]: value,
      }))
   }

   const deleteUser = () => {
      toggle()

      const deleteUser = async id => {
         try {
            await fetch(`${API_URL}${ADMIN_USERS_ENDPOINT}/${id}`, { method: METHOD_DELETE })
            router.push("/administration/users")
         } catch (error) {
            logError(error)
            setError(error)
         }
      }

      deleteUser(id)
   }

   const onSubmit = values => {
      console.log(values)

      if (error) {
         setError("Erreur dans le formulaire")
      }
   }

   return (
      <Layout currentUser={currentUser}>
         <Container style={{ maxWidth: 720 }} className="mt-5 mb-4">
            <Title1 className="mb-5">{"Utilisateur"}</Title1>

            {error && <Alert color="danger">{error}</Alert>}

            <Form onSubmit={onSubmit}>
               <FormGroup row>
                  <Label for="id" sm={3}>
                     Id
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="id" id="id" disabled value={user.id} onChange={onChange} />
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="firstName" sm={3}>
                     Prénom
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="firstName" id="firstName" value={user.firstName} onChange={onChange} />
                     <FormFeedback>Erreur sur le prénom</FormFeedback>
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="lastName" sm={3}>
                     Nom&nbsp;
                     <MandatorySign />
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="lastName" id="lastName" value={user.lastName} onChange={onChange} />
                     <FormFeedback>Erreur sur le nom</FormFeedback>
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="email" sm={3}>
                     Courriel&nbsp;
                     <MandatorySign />
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="email" id="email" value={user.email} onChange={onChange} />
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="role" sm={3}>
                     Rôle&nbsp;
                     <MandatorySign />
                  </Label>
                  <Col sm={9}>
                     <Input type="select" name="role" id="role" value={user.role} onChange={onChange}>
                        {Object.keys(ROLES).map(key => (
                           <option key={key} value={key} selected={key === user.role}>
                              {ROLES_DESCRIPTION[key]}
                           </option>
                        ))}
                     </Input>
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="hospital" sm={3}>
                     {"Établissement d'appartenance"}
                  </Label>
                  <Col sm={9}>
                     <Input type="text" name="hospital" id="hospital" onChange={onChange} />
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
                     <Input type="text" name="scope" id="scope" onChange={onChange} />
                  </Col>
               </FormGroup>
               <div className="justify-content-center d-flex">
                  <Button className="px-4 mt-5 mr-3" color="primary">
                     {isEmpty(initialUser) ? "Ajouter" : "Modifier"}
                  </Button>
                  <Link href="/administration/users">
                     <Button className="px-4 mt-5 " outline color="primary">
                        Retour
                     </Button>
                  </Link>
               </div>
               {!isEmpty(initialUser) && (
                  <div style={{ backgroundColor: "#f7d7d4" }} className="px-4 py-3 mt-5 rounded">
                     <Title1 className="mb-4">Zone dangereuse</Title1>
                     <div
                        style={{ color: "#7d2a21", borderColor: "#f4c7c2" }}
                        className="d-flex justify-content-between align-items-center"
                     >
                        Je souhaite supprimer cet utilisateur
                        <Button className="" color="danger" outline onClick={toggle}>
                           Supprimer
                        </Button>
                     </div>
                  </div>
               )}
            </Form>
            <div>
               <Modal isOpen={modal} toggle={toggle}>
                  <ModalHeader toggle={toggle}>Voulez-vous vraiment supprimer cet utilisateur?</ModalHeader>
                  <ModalBody>
                     Si vous supprimez cet utilisateur, il ne serait plus visible ni modifiable dans la liste des
                     utilisateurs. Merci de confirmer votre choix.
                  </ModalBody>
                  <ModalFooter>
                     <Button color="primary" onClick={deleteUser}>
                        Supprimer
                     </Button>{" "}
                     <Button color="secondary" onClick={toggle}>
                        Annuler
                     </Button>
                  </ModalFooter>
               </Modal>
            </div>
         </Container>
      </Layout>
   )
}

UserDetail.getInitialProps = async ctx => {
   const authHeaders = buildAuthHeaders(ctx)

   const { id } = ctx.query

   if (!id) return { initialUser: {} }

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
