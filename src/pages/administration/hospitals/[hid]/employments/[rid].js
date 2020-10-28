import React, { useState } from "react"
import Link from "next/link"
import PropTypes from "prop-types"
import { Controller, useForm } from "react-hook-form"
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos"

import { useRouter } from "next/router"

import { Button, Col, Alert, Container, Form, FormFeedback, FormGroup, Input, Label } from "reactstrap"

import Layout from "../../../../../components/Layout"
import MonthPicker from "../../../../../components/MonthPicker"
import { createReferences, findReference, updateReferences } from "../../../../../clients/employments-references"
import { Title1, Title2 } from "../../../../../components/StyledComponents"
import { now } from "../../../../../utils/date"
import { logDebug, logError } from "../../../../../utils/logger"
import { getReferenceData } from "../../../../../utils/init"
import { ADMIN } from "../../../../../utils/roles"
import { isEmpty } from "../../../../../utils/misc"
import { buildAuthHeaders, redirectIfUnauthorized, withAuthentication } from "../../../../../utils/auth"

const EmploymentsReferencesDetailPage = ({ data, currentUser }) => {
  const router = useRouter()
  const { hid } = router.query

  const [hospital] = getReferenceData("hospitals").filter((hospital) => hospital.id === parseInt(hid))

  const dateNow = now()
  const year = dateNow.year()
  const month = dateNow.month()

  let defaultValues = {
    startMonth: data ? { year: data.year, month: parseInt(data.month, 10) } : { year, month },
  }

  if (data?.reference) {
    defaultValues = { ...defaultValues, id: data?.id || null, reference: data.reference }
  }

  const { control, handleSubmit, register, errors: formErrors, setValue } = useForm({
    defaultValues,
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const onSubmit = async (formData) => {
    setSuccess("")
    setError("")

    try {
      if (isEmpty(formErrors)) {
        let payload = {
          hospitalId: hid,
          reference: formData.reference,
          year: formData.startMonth.year,
          month: formData.startMonth.month?.toString().padStart(2, "0"),
        }

        if (formData?.id) {
          payload = { id: formData?.id, ...payload }
          const { updated } = await updateReferences({ payload })
          logDebug(`Nb updated rows: ${updated}`)
          setSuccess("Références modifiées.")
        } else {
          formData.id = null
          const { id } = await createReferences({ payload })

          setValue("id", id || "")
          setSuccess("Références créés.")
        }
      }
    } catch (error) {
      console.error(error)
      setError(error.detail || "Erreur serveur.")
    }
  }

  return (
    <Layout page="hospitals" currentUser={currentUser} admin={true}>
      <Container
        style={{ maxWidth: 980, minWidth: 740 }}
        className="mt-5 mb-5 d-flex justify-content-between align-items-baseline"
      >
        <div className="d-flex justify-content-between">
          <Link href="/administration/hospitals/[hid]/employments" as={`/administration/hospitals/${hid}/employments`}>
            <a>
              <ArrowBackIosIcon width={30} style={{ width: 15 }} />
              Retour
            </a>
          </Link>
        </div>

        <Title1>Hôpital {hospital?.name}</Title1>
        <span></span>
      </Container>

      <Container style={{ maxWidth: 980, minWidth: 740 }}>
        <Title2 className="mt-4 mb-3">Paramètres ETP</Title2>

        {error && <Alert color="danger mt-4">{error}</Alert>}

        {success && (
          <Alert color="success" className="d-flex justify-content-between align-items-center mt-4">
            {success}&nbsp;
            <div>
              <Link
                href="/administration/hospitals/[hid]/employments"
                as={`/administration/hospitals/${hid}/employments`}
              >
                <Button className="mr-3" outline color="success">
                  <a>Retour à la liste</a>
                </Button>
              </Link>
            </div>
          </Alert>
        )}

        <Form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <FormGroup row>
            <Label for="others" sm={3}>
              {"Mois d'effet "}
            </Label>
            <Col sm={9}>
              <Controller as={MonthPicker} control={control} name="startMonth" />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="id" sm={3}>
              Id
            </Label>
            <Col sm={9}>
              <Input type="text" name="id" id="id" disabled innerRef={register} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="doctors" sm={3}>
              Médecins&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="reference.doctors"
                id="doctors"
                innerRef={register}
                invalid={!!formErrors.etp?.doctors}
                min={0}
                defaultValue={0}
                step="0.05"
              />

              <FormFeedback>{formErrors.etp?.doctors?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="secretaries" sm={3}>
              Secrétaires&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="reference.secretaries"
                id="secretaries"
                innerRef={register}
                invalid={!!formErrors.etp?.secretaries}
                min={0}
                defaultValue={0}
                step="0.05"
              />
              <FormFeedback>{formErrors.etp?.secretaries?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="nursings" sm={3}>
              Aide soignant.e&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="reference.nursings"
                id="nursings"
                innerRef={register}
                invalid={!!formErrors.etp?.nursings}
                min={0}
                defaultValue={0}
                step="0.05"
              />
              <FormFeedback>{formErrors.etp?.nursings?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="executives" sm={3}>
              Cadre de santé&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="reference.executives"
                id="executives"
                innerRef={register}
                invalid={!!formErrors.etp?.executives}
                min={0}
                defaultValue={0}
                step="0.05"
              />
              <FormFeedback>{formErrors.etp?.executives?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="ides" sm={3}>
              IDE&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="reference.ides"
                id="ides"
                innerRef={register}
                invalid={!!formErrors.etp?.ides}
                min={0}
                defaultValue={0}
                step="0.05"
              />
              <FormFeedback>{formErrors.etp?.ides?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="auditoriumAgents" sm={3}>
              {"Agent d'amphithéâtre"}&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="reference.auditoriumAgents"
                id="auditoriumAgents"
                innerRef={register}
                invalid={!!formErrors.etp?.auditoriumAgents}
                min={0}
                defaultValue={0}
                step="0.05"
              />
              <FormFeedback>{formErrors.etp?.auditoriumAgents?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="others" sm={3}>
              Autres&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="reference.others"
                id="others"
                innerRef={register}
                invalid={!!formErrors.etp?.others}
                min={0}
                defaultValue={0}
                step="0.05"
              />
              <FormFeedback>{formErrors.etp?.others?.message}</FormFeedback>
            </Col>
          </FormGroup>

          <div className="justify-content-center d-flex">
            <Link
              href="/administration/hospitals/[hid]/employments"
              as={`/administration/hospitals/${hid}/employments`}
            >
              <Button className="px-4 mt-5 mr-3" outline color="primary">
                Annuler
              </Button>
            </Link>
            <Button className="px-4 mt-5 " color="primary">
              {!data?.id ? "Ajouter" : "Modifier"}
            </Button>
          </div>
        </Form>
      </Container>
    </Layout>
  )
}

EmploymentsReferencesDetailPage.propTypes = {
  currentUser: PropTypes.object,
  data: PropTypes.object,
}

EmploymentsReferencesDetailPage.getInitialProps = async (ctx) => {
  const headers = buildAuthHeaders(ctx)

  const { hid, rid } = ctx.query

  if (rid === "new") return {}

  try {
    const data = await findReference({ hospitalId: hid, referencesId: rid, headers })
    return { data, key: Number(new Date()) }
  } catch (error) {
    logError("APP error", error)

    redirectIfUnauthorized(error, ctx)
  }
  return {}
}

export default withAuthentication(EmploymentsReferencesDetailPage, ADMIN)
