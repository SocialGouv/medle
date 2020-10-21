import React from "react"
import Link from "next/link"
import PropTypes from "prop-types"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers"
import { Controller, useForm } from "react-hook-form"

import {
  Badge,
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

import Layout from "../../../../components/Layout"
import { Title1, Title2 } from "../../../../components/StyledComponents"
import AddIcon from "@material-ui/icons/Add"
import { SearchButton } from "../../../../components/form/SearchButton"
import { isEmpty } from "../../../../utils/misc"
import { now } from "../../../../utils/date"
import { logError, logDebug } from "../../../../utils/logger"

const schema = yup.object({
  doctors: yup.number().typeError("Le nombre d'ETP est incorrect."),
  secretaries: yup.number().typeError("Le nombre d'ETP est incorrect."),
  nursings: yup.number().typeError("Le nombre d'ETP est incorrect."),
  executives: yup.number().typeError("Le nombre d'ETP est incorrect."),
  ides: yup.number().typeError("Le nombre d'ETP est incorrect."),
  auditoriumAgents: yup.number().typeError("Le nombre d'ETP est incorrect."),
  others: yup.number().typeError("Le nombre d'ETP est incorrect."),
})

const NewEmploymentBasePage = ({ currentUser }) => {
  const dateNow = now()
  const year = dateNow.year()
  const month = dateNow.month()

  console.log("NewEmploymentBasePage -> month", month)
  console.log("NewEmploymentBasePage -> year", year)

  const { control, handleSubmit, register, errors: formErrors, setValue } = useForm({
    defaultValues: {
      startMonth: { year, month },
    },
    resolver: yupResolver(schema),
  })

  const onSubmit = async (etp) => {
    console.log("etp", etp)
    // setError("")
    // setsuccess("")
    // try {
    //   if (isEmpty(formErrors)) {
    //     if (etp.id) {
    //       const { updated } = await updateBaseETP({ etp })
    //       logDebug(`Nb updated rows: ${updated}`)
    //       setsuccess("Hôpital modifié.")
    //     } else {
    //       hospital.id = null
    //       const { id } = await createBaseETP({ etp })
    //       setValue("id", id || "")
    //       setsuccess("Hôpital créé.")
    //     }
    //   }
    // } catch (error) {
    //   setError("Erreur serveur.")
    // }
  }

  return (
    <Layout page="hospitals" currentUser={currentUser} admin={true}>
      <Container style={{ maxWidth: 740, minWidth: 740 }} className="mt-5 mb-5">
        <Title1 className="">{"ETP de référence"}</Title1>

        <Title2 className="mt-4 mb-3">Paramètres ETP</Title2>

        <Form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <FormGroup row>
            <Label for="doctors" sm={3}>
              Médecins&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="doctors"
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
                name="secretaries"
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
                name="nursings"
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
                name="executives"
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
                name="ides"
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
                name="auditoriumAgents"
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
                name="others"
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
          <FormGroup row>
            <Label for="others" sm={3}>
              Mois d'effet&nbsp;
            </Label>
            <Col sm={9}>
              <Controller as={MonthPicker} control={control} name="startMonth" />

              {/* <MonthPicker value={{ year: "2020", month: "3" }} /> */}
              <FormFeedback>{formErrors.etp?.others?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <div className="justify-content-center d-flex">
            <Link href="/administration/hospitals">
              <Button className="px-4 mt-5 mr-3" outline color="primary">
                Annuler
              </Button>
            </Link>
            <Button className="px-4 mt-5 " color="primary">
              {/* {isEmpty(etp) ? "Ajouter" : "Modifier"} */}
              Ajouter
            </Button>
          </div>
        </Form>
      </Container>
    </Layout>
  )
}

const months = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
]

const MonthPicker = ({ value, minValue, onChange }) => {
  const { year, month } = value

  const add = () => {
    onChange({
      year: value.month === months.length - 1 ? value.year + 1 : value.year,
      month: (value.month + 1) % 12,
    })
  }

  const substract = () => {
    onChange({
      year: value.month === 0 ? value.year - 1 : value.year,
      month: value.month > 0 ? value.month - 1 : 11,
    })
  }

  // A11y keyboard navigation: push space key to activate the button
  const keyPress = (event, fn) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      fn(event)
    }
  }

  return (
    <>
      <svg
        onClick={substract}
        onKeyPress={(e) => keyPress(e, substract)}
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="mr-4 bg-secondary rounded-circle"
        style={{ width: 24, height: 24 }}
        tabIndex="0"
      >
        <path
          fill="#FFF"
          d="M16 10c0 .553-.048 1-.601 1H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H15.4c.552 0 .6.447.6 1z"
        ></path>
      </svg>
      <span className="d-inline-block text-center" style={{ width: 120 }}>
        {months[month]} {year}
      </span>

      <svg
        onClick={add}
        onKeyPress={(e) => keyPress(e, add)}
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="w-8 h-8 p-1 ml-4 bg-secondary rounded-circle"
        style={{ width: 24, height: 24 }}
        tabIndex="0"
      >
        <path
          fill="#FFF"
          d="M16 10c0 .553-.048 1-.601 1H11v4.399c0 .552-.447.601-1 .601-.553 0-1-.049-1-.601V11H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H9V4.601C9 4.048 9.447 4 10 4c.553 0 1 .048 1 .601V9h4.399c.553 0 .601.447.601 1z"
        ></path>
      </svg>
    </>
  )
}

MonthPicker.propTypes = {
  value: PropTypes.object,
  minValue: PropTypes.object,
  defaultValue: PropTypes.object,
}

export default NewEmploymentBasePage
