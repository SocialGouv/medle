import Link from "next/link"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import React from "react"
import Select from "react-select"
import { Alert, Col, Container, Form, FormGroup, Input, Row, Table } from "reactstrap"

import { findLastEdit } from "../../clients/employments"
import { CurrentMonthEmployments, PassedMonthEmployments } from "../../components/EmploymentMonthData"
import Layout from "../../components/Layout"
import { Title1, Title2 } from "../../components/StyledComponents"
import { START_YEAR_MEDLE } from "../../config"
import { useDebounce } from "../../hooks/useDebounce"
import { buildScope } from "../../services/scope"
import { withAuthentication } from "../../utils/auth"
import { isoToFr, NAME_MONTHS, now } from "../../utils/date"
import { getReferenceData } from "../../utils/init"
import { castArrayInMap } from "../../utils/object"
import { canAccessAllHospitals, EMPLOYMENT_CONSULTATION } from "../../utils/roles"

function buildEmploymentDataMonth({ currentYear, currentMonth, selectedYear, hospitalId }) {
  if (currentYear === selectedYear) {
    return [
      <CurrentMonthEmployments key={currentMonth} month={currentMonth} year={selectedYear} hospitalId={hospitalId} />,
      Array(Number(currentMonth - 1))
        .fill(0)
        .map((_, index) => String(index + 1).padStart(2, "0"))
        .reverse()
        .map((month) => (
          <PassedMonthEmployments key={month} month={month} year={selectedYear} hospitalId={hospitalId} />
        )),
    ]
  }

  return Array(12)
    .fill(0)
    .map((_, index) => String(index + 1).padStart(2, "0"))
    .reverse()
    .map((month) => <PassedMonthEmployments key={month} month={month} year={selectedYear} hospitalId={hospitalId} />)
}

/**
 * Return month and year parts
 * @param {*} date in moment.js format
 */
function decomposeDate(date) {
  const currentMonth = date.format("MM")
  const currentYear = Number(date.format("YYYY"))

  return { currentMonth, currentYear }
}

function formatMonthYear({ month, year }) {
  return NAME_MONTHS[month] + " " + year
}

function formatTitle({ currentMonth, currentYear, selectedYear }) {
  return selectedYear === currentYear ? NAME_MONTHS[currentMonth] + " " + selectedYear : `Année ${selectedYear}`
}

function describeRequest({ currentUser, selectedHospitalId }) {
  const hasManyHospitals = buildScope(currentUser)?.length > 1 || canAccessAllHospitals(currentUser)

  return hasManyHospitals
    ? selectedHospitalId
      ? "SUPERVISOR_HAS_SELECTED"
      : "SUPERVISOR_HAS_NOT_SELECTED"
    : selectedHospitalId
      ? "OPERATOR_HAS_EXPLICITLY_SELECTED"
      : "OPERATOR_HAS_IMPLICITLY_SELECTED"
}

function formatLastEdit({ edit, hospitalId }) {
  return {
    hospitalId,
    lastAddedMonth: !edit.month
      ? null
      : formatMonthYear({
        month: edit.month,
        year: edit.year,
      }),
    lastUpdated: !edit.lastupdated ? null : isoToFr(edit.lastupdated),
  }
}

export const EmploymentsPage = ({ currentUser }) => {
  const router = useRouter()
  // the id hospital the user wants. The hid is an array for Next.js
  const { hid } = router.query

  const selectedHospitalId = Number(hid?.[0])

  switch (describeRequest({ currentUser, selectedHospitalId })) {
    case "SUPERVISOR_HAS_NOT_SELECTED":
      return <ListEmploymentsHospital currentUser={currentUser} />
    case "SUPERVISOR_HAS_SELECTED":
      if (canAccessAllHospitals(currentUser) || buildScope(currentUser).includes(selectedHospitalId)) {
        return <EmploymentsHospital currentUser={currentUser} hospitalId={selectedHospitalId} />
      }
      // TODO: gestion page d'erreur
      return "Vous n'êtes pas autorisé à voir cet hôpital"
    case "OPERATOR_HAS_IMPLICITLY_SELECTED":
      return <EmploymentsHospital currentUser={currentUser} hospitalId={currentUser.hospital?.id} />
    case "OPERATOR_HAS_EXPLICITLY_SELECTED":
      if (selectedHospitalId !== currentUser.hospital?.id) {
        return "Vous n'êtes pas autorisé à voir cet hôpital"
      }
      return <EmploymentsHospital currentUser={currentUser} hospitalId={selectedHospitalId} />
  }
}

const ListEmploymentsHospital = ({ currentUser }) => {
  const [hospitals, setHospitals] = React.useState([])
  const [search, setSearch] = React.useState("")
  const [lastEdits, setLastEdits] = React.useState([])

  useDebounce(handleSubmit, 500, [search])

  // TODO: faire un hook pour récupérer n'importe où tous les hôpitaux d'un utilisateur
  const filterHospitals = React.useCallback(
    (search) => {
      // Get the hospitals allowed by the user
      const scopeUser = buildScope(currentUser)
      const hospitals = canAccessAllHospitals(currentUser)
        ? getReferenceData("hospitals")
        : getReferenceData("hospitals").filter((hospital) => scopeUser.includes(hospital.id))

      // Filter by search if any
      return !search ? hospitals : hospitals.filter((hospital) => hospital?.name.match(new RegExp(search, "i")))
    },
    [currentUser],
  )

  React.useEffect(() => {
    const fetchData = async () => {
      const allHospitalsOfUser = filterHospitals()
      setHospitals(allHospitalsOfUser)

      const promises = allHospitalsOfUser.map((hospital) => findLastEdit({ hospitalId: hospital?.id }))

      Promise.all(promises)
        .then((edits) => {
          // Promises and allHospitalsOfUser are in the same order, so it's safe to get id from allHospitalsOfUser.
          edits = edits.map((edit, index) => formatLastEdit({ edit, hospitalId: allHospitalsOfUser[index].id }))

          return castArrayInMap({ array: edits, propAsKey: "hospitalId" })
        })
        .then((edits) => {
          setLastEdits(edits)
        })
    }
    fetchData()
  }, [filterHospitals])

  function handleSearchChange(event) {
    setSearch(event.target.value)
  }

  function handleSubmit(event) {
    event?.preventDefault()
    setHospitals(filterHospitals(search))
  }

  function noUpToDate(hospital) {
    return !lastEdits[hospital.id]?.lastAddedMonth || lastEdits[hospital.id]?.lastAddedMonth < now().year()
  }

  return (
    <Layout page="emploments" currentUser={currentUser}>
      <Title1 className="mt-5 mb-4">{"Tous les établissements"}</Title1>
      <Container style={{ maxWidth: 980 }}>
        <Form onSubmit={handleSubmit}>
          <FormGroup inline className="mb-4 justify-content-center">
            <Row>
              <Col className="flex-grow-1">
                <Input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Rechercher un établissement"
                  autoComplete="off"
                  value={search}
                  onChange={handleSearchChange}
                />
              </Col>
            </Row>
          </FormGroup>
        </Form>
        <div className="my-4 d-flex justify-content-center">
          <b>{hospitals?.length || 0}</b>&nbsp;résultat{hospitals?.length > 1 && "s"}
        </div>
        <Table responsive className="table-hover">
          <thead>
            <tr className="table-light">
              <th>Établissement</th>
              <th>Dernier mois ajouté</th>
              <th>Ajouté le</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {hospitals.map((hospital) => (
              <Link key={hospital.id} href="/employments/[[...hid]]" as={`/employments/${hospital?.id}`}>
                <tr key={hospital.id}>
                  <td title={noUpToDate(hospital) ? "Certains mois de l'année précédente manquent " : ""}>
                    <span className={noUpToDate(hospital) ? "mark" : ""}>{hospital.name}</span>
                  </td>
                  <td>{lastEdits[hospital.id]?.lastAddedMonth}</td>
                  <td>{lastEdits[hospital.id]?.lastUpdated}</td>
                  <td>
                    <Link href="/employments/[[...hid]]" as={`/employments/${hospital?.id}`}>
                      <a className="text-decoration-none">Voir &gt;</a>
                    </Link>
                  </td>
                </tr>
              </Link>
            ))}
          </tbody>
        </Table>
      </Container>
    </Layout>
  )
}

const EmploymentsHospital = ({ currentUser, hospitalId }) => {
  const { currentMonth, currentYear } = decomposeDate(now())
  const [selectedYear, setSelectedYear] = React.useState(currentYear)

  const [employmentDataMonths, setEmploymentDataMonths] = React.useState()

  const [error, setError] = React.useState("")

  const title = formatTitle({ currentMonth, currentYear, selectedYear })

  React.useEffect(() => {
    const scopeUser = buildScope(currentUser)

    if (canAccessAllHospitals(currentUser) || scopeUser.includes(hospitalId)) {
      setEmploymentDataMonths(buildEmploymentDataMonth({ currentMonth, currentYear, hospitalId, selectedYear }))
    } else {
      setError("Vous n'êtes pas autorisé à voir les ETP de cet établissement.")
    }
  }, [currentUser, currentYear, currentMonth, selectedYear, hospitalId])

  const yearsOptions = Array(currentYear - START_YEAR_MEDLE + 1)
    .fill(0)
    .map((_, index) => START_YEAR_MEDLE + index)
    .reverse()
    .map((current) => ({ label: current, value: current }))

  function handleYearChange(option) {
    setSelectedYear(option.value)
  }

  const [hospital] = getReferenceData("hospitals").filter((hospital) => hospital.id === hospitalId)

  return (
    <Layout page="employments" currentUser={currentUser}>
      <div className="d-flex flex-column flex-md-row justify-content-center align-items-center">
        <Title1 className="mt-5 mb-2 mr-5 mb-md-5">
          Déclaration du personnel {hospital?.name && ` de ${hospital.name}`}{" "}
        </Title1>
        <div className="mb-3 flex-grow-1 mb-md-0" style={{ maxWidth: 100 }}>
          <Select options={yearsOptions} defaultValue={yearsOptions[0]} onChange={handleYearChange} />
        </div>
      </div>
      <Container style={{ maxWidth: 720 }}>
        {error ? (
          <Alert color="danger" className="mb-4">
            {error}
          </Alert>
        ) : (
            <>
              <Title2 className="mb-4 text-capitalize">{title}</Title2>
              <p className="mb-0 text-center font-italic">
                {"Veuillez indiquer le nombre d'ETP pour les différents profils de votre UMJ/IML."}
              </p>
              <p className="mb-5 text-center">
                <small>
                  Attention, un ETP est un Equivalent Temps Plein et non un poste.{" "}
                  <Link href={"/faq"}>
                    <a>{"+ d'infos dans la FAQ"}</a>
                  </Link>
                .
              </small>
              </p>
              {employmentDataMonths}
            </>
          )}
      </Container>
    </Layout>
  )
}

EmploymentsPage.propTypes = {
  currentUser: PropTypes.object,
}

ListEmploymentsHospital.propTypes = { ...EmploymentsPage.propTypes, hospitalId: PropTypes.number }

EmploymentsHospital.propTypes = ListEmploymentsHospital.propTypes

export default withAuthentication(EmploymentsPage, EMPLOYMENT_CONSULTATION)
