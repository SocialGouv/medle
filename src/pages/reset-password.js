import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"
import { useForm } from "react-hook-form"
import { Button, Col, Container, Form, FormFeedback, FormGroup, Input, Label } from "reactstrap"

import { resetPassword } from "../clients/users"
import Layout from "../components/Layout"
import StatusComponent from "../components/StatusComponent"
import { Title1 } from "../components/StyledComponents"
import { isEmpty } from "../utils/misc"

const UserReset = () => {
  const { handleSubmit, register, errors: formErrors, watch } = useForm()
  const [status, setStatus] = React.useState({ type: "idle" })
  const router = useRouter()
  const { loginToken } = router.query

  const onSubmit = async (data) => {
    setStatus({ type: "pending" })

    try {
      if (isEmpty(formErrors)) {
        await resetPassword({ loginToken, password: data.firstValue })
        setStatus({ message: "Mot de passe réinitialisé.", type: "success" })
      }
    } catch (error) {
      setStatus({ message: "Erreur serveur", type: "error" })
    }
  }

  return (
    <Layout>
      <Container style={{ maxWidth: 720 }} className="mt-5 mb-4">
        <Title1>{"Changement de mot de passe"}</Title1>

        {status?.message && <StatusComponent {...status} />}

        <Form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <FormGroup row>
            <Label for="firstValue" sm={4}>
              Mot de passe
            </Label>
            <Col sm={8}>
              <Input
                type="password"
                name="firstValue"
                id="firstValue"
                innerRef={register({
                  pattern: {
                    value: /^[a-zA-Z0-9]{8,30}$/,
                  },
                  required: true,
                })}
                invalid={!!formErrors.firstValue}
              />
              <FormFeedback>
                {formErrors.firstValue && "Mot de passe invalide (8 à 30 caractères avec lettres ou chiffres)."}
              </FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="confirmedValue" sm={4}>
              Confirmation mot de passe
            </Label>
            <Col sm={8}>
              <Input
                type="password"
                name="confirmedValue"
                id="confirmedValue"
                innerRef={register({
                  required: true,
                  validate: (value) => {
                    return value === watch("firstValue")
                  },
                })}
                invalid={!!formErrors.confirmedValue}
              />
              <FormFeedback>{formErrors.confirmedValue && "Les mots de passe ne correspondent pas."}</FormFeedback>
            </Col>
          </FormGroup>
          <div className="justify-content-center d-flex">
            <Link href="/administration/users">
              <Button className="px-4 mt-5 mr-3" outline color="primary">
                Annuler
              </Button>
            </Link>
            <Button className="px-4 mt-5 " color="primary" onClick={handleSubmit(onSubmit)}>
              Appliquer
            </Button>
          </div>
        </Form>
      </Container>
    </Layout>
  )
}

export default UserReset
