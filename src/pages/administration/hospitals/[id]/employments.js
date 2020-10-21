import React from "react"

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
import Link from "next/link"
import AddIcon from "@material-ui/icons/Add"
import { SearchButton } from "../../../../components/form/SearchButton"

import { Title1, Title2 } from "../../../../components/StyledComponents"

import Layout from "../../../../components/Layout"
import { useRouter } from "next/router"

const EmploymentsPage = ({ currentUser }) => {
  const router = useRouter()

  const { id } = router.query

  return (
    <Layout page="hospitals" currentUser={currentUser} admin={true}>
      <Container
        style={{ maxWidth: 980, minWidth: 740 }}
        className="mt-5 mb-5 d-flex justify-content-between align-items-baseline"
      >
        <Title1 className="">{"ETP de référence"}</Title1>
        <Link href={`/administration/hospitals/${[id]}/new`}>
          <a>
            <SearchButton className="btn-outline-primary">
              <AddIcon />
              &nbsp; Ajouter
            </SearchButton>
          </a>
        </Link>
      </Container>

      <Container style={{ maxWidth: 980, minWidth: 740 }}>
        <Title2>Liste des ETP de référence</Title2>
      </Container>
    </Layout>
  )
}

export default EmploymentsPage
