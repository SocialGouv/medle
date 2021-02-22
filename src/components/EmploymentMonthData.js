import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos"
import EditOutlinedIcon from "@material-ui/icons/Edit"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import { Alert, Button, Col, FormFeedback, Input, Row } from "reactstrap"

import { findEmployment, updateEmployment } from "../clients/employments"
import { searchReferenceForMonth } from "../clients/employments-references"
import { AnchorButton, Label, ValidationButton } from "../components/StyledComponents"
import { NAME_MONTHS } from "../utils/date"
import { logError } from "../utils/logger"
import { isEmpty, pluralize } from "../utils/misc"
import { EMPLOYMENT_MANAGEMENT, isAllowed } from "../utils/roles"
import Badge from "./Badge"

const makeLabel = (number) => (number ? `${number} ETP prévu${pluralize(number)}` : null)

export const hasErrors = (dataMonth) => {
  const errors = {}

  if (dataMonth.doctors && isNaN(dataMonth.doctors)) {
    errors.doctors = "Nombre requis"
  }
  if (dataMonth.secretaries && isNaN(dataMonth.secretaries)) {
    errors.secretaries = "Nombre requis"
  }
  if (dataMonth.nursings && isNaN(dataMonth.nursings)) {
    errors.nursings = "Nombre requis"
  }
  if (dataMonth.executives && isNaN(dataMonth.executives)) {
    errors.executives = "Nombre requis"
  }
  if (dataMonth.ides && isNaN(dataMonth.ides)) {
    errors.ides = "Nombre requis"
  }
  if (dataMonth.auditoriumAgents && isNaN(dataMonth.auditoriumAgents)) {
    errors.auditoriumAgents = "Nombre requis"
  }
  if (dataMonth.others && isNaN(dataMonth.others)) {
    errors.others = "Nombre requis"
  }

  return errors
}

const FormEmployment = ({ errors, dataMonth, handleChange, reference, readOnly = false }) => {
  return (
    <>
      <Row>
        <Col className="mr-3">
          <Label htmlFor="doctors">Médecin</Label>
          <Input
            name="doctors"
            type="number"
            min={0}
            step="0.05"
            invalid={!!errors?.doctors}
            placeholder="ex: 2,1"
            value={dataMonth?.["doctors"] || ""}
            onChange={handleChange}
            disabled={readOnly}
            autoComplete="off"
          />
          <FormFeedback>{errors?.doctors}</FormFeedback>

          <Badge value={makeLabel(reference?.doctors)} />
        </Col>
        <Col className="mr-3">
          <Label htmlFor="secretaries">Secrétaire</Label>
          <Input
            name="secretaries"
            type="number"
            min={0}
            step="0.05"
            invalid={!!errors?.secretaries}
            placeholder="ex: 2,1"
            value={dataMonth?.["secretaries"] || ""}
            onChange={handleChange}
            disabled={readOnly}
            autoComplete="off"
          />
          <FormFeedback>{errors?.secretaries}</FormFeedback>
          <Badge value={makeLabel(reference?.secretaries)} />
        </Col>
        <Col className="mr-3">
          <Label htmlFor="nursings">Aide soignant.e</Label>
          <Input
            name="nursings"
            type="number"
            min={0}
            step="0.05"
            invalid={!!errors?.nursings}
            placeholder="ex: 2,1"
            value={dataMonth?.["nursings"] || ""}
            onChange={handleChange}
            disabled={readOnly}
            autoComplete="off"
          />

          <FormFeedback>{errors?.nursings}</FormFeedback>
          <Badge value={makeLabel(reference?.nursings)} />
        </Col>
        <Col className="mr-3">
          <Label htmlFor="executives">Cadre de santé</Label>
          <Input
            name="executives"
            type="number"
            min={0}
            step="0.05"
            invalid={!!errors?.executives}
            placeholder="ex: 2,1"
            value={dataMonth?.["executives"] || ""}
            onChange={handleChange}
            disabled={readOnly}
            autoComplete="off"
          />
          <FormFeedback>{errors?.executives}</FormFeedback>
          <Badge value={makeLabel(reference?.executives)} />
        </Col>
      </Row>
      <Row className="my-4">
        <Col className="mr-3">
          <Label htmlFor="ides">IDE</Label>
          <Input
            name="ides"
            type="number"
            min={0}
            step="0.05"
            invalid={!!errors?.ides}
            placeholder="ex: 2,1"
            value={dataMonth?.["ides"] || ""}
            onChange={handleChange}
            disabled={readOnly}
            autoComplete="off"
          />
          <FormFeedback>{errors?.ides}</FormFeedback>
          <Badge value={makeLabel(reference?.ides)} />
        </Col>
        <Col className="mr-3">
          <Label htmlFor="auditoriumAgents">{"Agent d'amphi."}</Label>
          <Input
            name="auditoriumAgents"
            type="number"
            min={0}
            step="0.05"
            invalid={!!errors?.auditoriumAgents}
            placeholder="ex: 2,1"
            value={dataMonth?.["auditoriumAgents"] || ""}
            onChange={handleChange}
            disabled={readOnly}
            autoComplete="off"
          />
          <FormFeedback>{errors?.auditoriumAgents}</FormFeedback>
          <Badge value={makeLabel(reference?.auditoriumAgents)} />
        </Col>
        <Col className="mr-3">
          <Label htmlFor="others">Autres</Label>
          <Input
            name="others"
            type="number"
            min={0}
            step="0.05"
            invalid={!!errors?.others}
            placeholder="ex: 2,1"
            value={dataMonth?.["others"] || ""}
            onChange={handleChange}
            disabled={readOnly}
            autoComplete="off"
          />
          <FormFeedback>{errors?.others}</FormFeedback>
          <Badge value={makeLabel(reference?.others)} />
        </Col>
        <Col className="mr-3" />
      </Row>
    </>
  )
}

FormEmployment.propTypes = {
  errors: PropTypes.object,
  dataMonth: PropTypes.object,
  reference: PropTypes.object,
  handleChange: PropTypes.func,
  readOnly: PropTypes.bool,
}

const EmploymentMonthData = ({ isCurrentMonth = false, month, year, readOnly, currentUser }) => {
  const [open, setOpen] = useState(false)
  const [readOnlyState, setReadOnlyState] = useState(readOnly)
  const [errors, setErrors] = useState()

  const [dataMonth, setDataMonth] = useState({})
  const [reference, setReference] = useState({})

  const [success, setSuccess] = useState("")

  const { hospital } = currentUser

  const monthName = NAME_MONTHS[month] + " " + year

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSuccess("")
    }, 2000)

    return () => {
      clearInterval(timeoutId)
    }
  }, [success, setSuccess])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const json = await findEmployment({ hospitalId: hospital.id, year, month })

        const etpReference = await searchReferenceForMonth({
          hospitalId: hospital.id,
          year,
          month,
        })

        setDataMonth(json)
        setReference(etpReference?.reference)
      } catch (error) {
        logError(error)
        return { error: "Erreur serveur" }
      }
    }

    fetchData()
  }, [hospital.id, month, open, year])

  const handleChange = (event) => {
    event.preventDefault()

    setDataMonth({ ...dataMonth, [event.target.name]: event.target.value })
  }

  const toggleReadOnly = () => setReadOnlyState((state) => !state)

  const handleUpdate = async () => {
    setErrors({})
    const errors = hasErrors(dataMonth)

    if (!isEmpty(errors)) {
      setErrors({ ...errors, general: "Erreur de saisie" })
      return
    }
    try {
      await updateEmployment({ hospitalId: hospital.id, year, month, dataMonth })
      setSuccess("Vos informations ont bien été enregistrées.")

      toggleReadOnly()
    } catch (error) {
      logError(error)
      setErrors({ general: "Erreur lors de la mise à jour des ETP" })
    }
  }

  // Specific display for current month.
  if (isCurrentMonth)
    return (
      <>
        {success && <Alert color="primary">{success}</Alert>}

        {!isEmpty(errors) && <Alert color="danger">{errors.general || "Erreur serveur"}</Alert>}

        <FormEmployment errors={errors} dataMonth={dataMonth} handleChange={handleChange} reference={reference} />
        {isAllowed(currentUser?.role, EMPLOYMENT_MANAGEMENT) && (
          <div className="my-5 text-center">
            <ValidationButton color="primary" size="lg" className="center" onClick={handleUpdate}>
              Valider
            </ValidationButton>
          </div>
        )}
      </>
    )

  return (
    <>
      <Button outline color="secondary" block className="pt-2 pb-2 pl-4 text-left" onClick={() => setOpen(!open)}>
        {monthName}
        {!open && <ArrowForwardIosIcon className="float-right" width={24} />}
        {open && <ExpandMoreIcon className="float-right" width={24} />}
      </Button>
      {open && (
        <div className="px-2">
          <div className="pt-3 pb-2 pr-2 text-right">
            {!isAllowed(currentUser?.role, EMPLOYMENT_MANAGEMENT) ? null : readOnlyState ? (
              <Button outline onClick={toggleReadOnly} className="border-0">
                Modifier <EditOutlinedIcon width={24} />
              </Button>
            ) : (
                <AnchorButton onClick={handleUpdate}>Enregistrer</AnchorButton>
              )}
          </div>

          {success && <Alert color="primary">{success}</Alert>}

          {!isEmpty(errors) && <Alert color="danger">{errors.general || "Erreur serveur"}</Alert>}

          <FormEmployment
            errors={errors}
            dataMonth={dataMonth}
            handleChange={handleChange}
            reference={reference}
            readOnly={readOnlyState}
          />
        </div>
      )}
    </>
  )
}

EmploymentMonthData.propTypes = {
  isCurrentMonth: PropTypes.bool,
  month: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  readOnly: PropTypes.bool.isRequired,
  currentUser: PropTypes.object,
}

EmploymentMonthData.defaultProps = {
  readOnly: true,
}

export default EmploymentMonthData
