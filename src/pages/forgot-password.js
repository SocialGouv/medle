import Link from "next/link"
import React from "react"
import { Button, Col, Container, Form, FormGroup, Input, Label } from "reactstrap"

import { forgotPassword } from "../clients/users"
import Layout from "../components/Layout"
import StatusComponent from "../components/StatusComponent"
import { Title1 } from "../components/StyledComponents"
import { ACTION, CATEGORY, trackEvent } from "../utils/matomo"

const ForgotPasswordPage = () => {
  const [email, setEmail] = React.useState()

  const [status, setStatus] = React.useState({ type: "idle" })

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email) {
      setStatus({
        message: "Veuillez renseigner le champ Courriel.",
        type: "error",
      })
      return
    }

    setStatus({ type: "pending" })

    try {
      await forgotPassword(email)

      trackEvent(CATEGORY.auth, ACTION.auth.oubliMdp, `${email} : OK`)
      setStatus({ message: `Un courriel vous a été envoyé.`, type: "success" })
    } catch (error) {
      console.error(`Error when trying to send email to ${email}`, error)

      trackEvent(CATEGORY.auth, ACTION.auth.oubliMdp, `${email} : Error (${error?.status})`)

      setStatus({
        message: error.status === 404 ? "Le courriel ne semble pas exister 😕." : "Erreur lors de l'envoi du courriel",
        type: "error",
      })
    }
  }

  function handleChange(event) {
    setStatus({ type: "idle" })
    const value = event?.target?.value

    setEmail(value)
  }

  return (
    <Layout>
      <Title1 className="mt-5">Vous avez oublié votre mot de passe&nbsp;?</Title1>
      <Container style={{ maxWidth: 700 }}>
        <span>&nbsp;</span>

        {status?.message && <StatusComponent {...status} />}

        <Form onSubmit={handleSubmit} className="mt-4">
          <FormGroup row>
            <Label for="email" sm={4}>
              Courriel
            </Label>
            <Col sm={8}>
              <Input type="email" name="email" id="email" onChange={handleChange} />
            </Col>
          </FormGroup>
          <div className="justify-content-center d-flex mt-4">
            <Link href="/">
              <Button className="px-4 mt-5 mr-3" outline color="primary">
                Annuler
              </Button>
            </Link>
            <Button className="px-4 mt-5 " color="primary" disabled={status?.type === "pending"}>
              Envoyer un email
            </Button>
          </div>
        </Form>
      </Container>
    </Layout>
  )
}

export default ForgotPasswordPage
