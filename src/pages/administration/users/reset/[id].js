import React, { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import PropTypes from "prop-types"
import fetch from "isomorphic-unfetch"
import {
   Alert,
   Button,
   Col,
   Row,
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
import GroupIcon from "@material-ui/icons/Group"

import { FORMAT_DATE } from "../../../../utils/date"
import { METHOD_PATCH } from "../../../../utils/http"

import { API_URL, RESET_PWD_ENDPOINT } from "../../../../config"
import Layout from "../../../../components/LayoutAdmin"
import ColumnAct from "../../../../components/ColumnAct"
import { Title1, Title2 } from "../../../../components/StyledComponents"
import { isEmpty } from "../../../../utils/misc"
import { handleAPIResponse } from "../../../../utils/errors"
import { buildAuthHeaders, redirectIfUnauthorized, withAuthentication } from "../../../../utils/auth"
import { isAllowed, ADMIN, ROLES, ROLES_DESCRIPTION } from "../../../../utils/roles"
import { logError } from "../../../../utils/logger"
import { profiles } from "../../../../utils/actsConstants"

const fetchPatch = async (id, password) => {
   try {
      const response = await fetch(`${API_URL}${RESET_PWD_ENDPOINT}`, {
         method: METHOD_PATCH,
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id, password }),
      })
      const modified = await handleAPIResponse(response)
      return modified
   } catch (error) {
      logError(error)
   }
}

const UserReset = ({ currentUser }) => {
   const [passwords, setPasswords] = useState({ firstValue: "", confirmedValue: "" })
   const [error, setError] = useState("")
   const [success, setsuccess] = useState("")

   const router = useRouter()

   const { id } = router.query

   const onChange = e => {
      // event will not be accessible in the asynchron setState format. Needs to store the value here in synchron mode
      const { id, value } = e.target

      setPasswords(passwords => ({
         ...passwords,
         [id]: value,
      }))
   }

   const onSubmit = async e => {
      e.preventDefault()

      setError("")

      console.log("passwords", passwords)
      //const { error } = schema.validate(passwords)

      if (error) {
         setError(
            "Le mot de passe doit avoir une taille comprise entre 8 et 30 caractères composées de lettres majuscules, minuscules et de chiffres.",
         )
         return
      }

      if (passwords.firstValue !== passwords.confirmedValue) {
         setError("Les mots de passe doivent correspondrent.")
         return
      }

      await fetchPatch(id, passwords.firstValue)

      setsuccess("Mot de passe mis à jour.")
   }

   return (
      <Layout currentUser={currentUser}>
         <Container style={{ maxWidth: 720 }} className="mt-5 mb-4">
            <Title1 className="mb-5">{"Utilisateur"}</Title1>

            {error && (
               <Alert color="danger" className="mb-4">
                  {error}
               </Alert>
            )}
            {success && <Alert>{success}</Alert>}

            <Form onSubmit={onSubmit}>
               <FormGroup row>
                  <Label for="firstValue" sm={4}>
                     Mot de passe
                  </Label>
                  <Col sm={8}>
                     <Input
                        type="text"
                        name="firstValue"
                        id="firstValue"
                        value={passwords.firstValue}
                        onChange={onChange}
                     />
                  </Col>
               </FormGroup>
               <FormGroup row>
                  <Label for="confirmedValue" sm={4}>
                     Confirmation mot de passe
                  </Label>
                  <Col sm={8}>
                     <Input
                        type="text"
                        name="confirmedValue"
                        id="confirmedValue"
                        value={passwords.confirmedValue}
                        onChange={onChange}
                     />
                  </Col>
               </FormGroup>
               <div className="justify-content-center d-flex">
                  <Button className="px-4 mt-5 mr-3" color="primary">
                     Mettre à jour
                  </Button>
                  <Link href="/administration/users" className="pl-3">
                     <Button className="px-4 mt-5 " outline color="primary">
                        <a>Retour</a>
                     </Button>
                  </Link>
               </div>
            </Form>
         </Container>
      </Layout>
   )
}

UserReset.propTypes = {
   initialUser: PropTypes.object,
   currentUser: PropTypes.object.isRequired,
}

export default withAuthentication(UserReset, ADMIN)
