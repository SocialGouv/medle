import Link from "next/link"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import React from "react"
import Select from "react-select"
import { Alert, Container } from "reactstrap"

import { CurrentMonthEmployments, PassedMonthEmployments } from "../../components/EmploymentMonthData"
import Layout from "../../components/Layout"
import { Title1, Title2 } from "../../components/StyledComponents"
import { START_YEAR_MEDLE } from "../../config"
import { buildScope } from "../../services/scope"
import { withAuthentication } from "../../utils/auth"
import { NAME_MONTHS, now } from "../../utils/date"
import { getReferenceData } from "../../utils/init"
import { EMPLOYMENT_CONSULTATION, isUserOfOnlyOneHospital } from "../../utils/roles"

function composeEmploymentDataMonth({ currentYear, currentMonth, selectedYear, hospitalId }) {
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

function composeTitle({ currentMonth, currentYear, selectedYear }) {
  return selectedYear === currentYear ? NAME_MONTHS[currentMonth] + " " + selectedYear : `Année ${selectedYear}`
}

export const EmploymentsPage = ({ currentUser }) => {
  const router = useRouter()
  // the id hospital the user wants. The hid is an array for Next.js
  const { hid } = router.query

  // TODO: gérer le cas 0, qui est considéré comme null et qui envoie sur la liste
  const selectedHospitalId = Number(hid?.[0]) || currentUser?.hospital?.id

  if (selectedHospitalId) {
    return <EmploymentsHospital currentUser={currentUser} hospitalId={selectedHospitalId} />
  } else {
    return <ListEmploymentsHospital currentUser={currentUser} hospitalId={selectedHospitalId} />
  }
}

const ListEmploymentsHospital = ({ currentUser, hospitalId }) => {
  return "Liste (à implémenter)"
}

const EmploymentsHospital = ({ currentUser, hospitalId }) => {
  const { currentMonth, currentYear } = decomposeDate(now())
  const [selectedYear, setSelectedYear] = React.useState(currentYear)

  const [employmentDataMonths, setEmploymentDataMonths] = React.useState()

  const [error, setError] = React.useState("")

  const title = composeTitle({ currentMonth, currentYear, selectedYear })

  React.useEffect(() => {
    const scopeUser = buildScope(currentUser)
    if (!scopeUser.length) {
      // TODO : gérer les pages d'erreur en cas de non autorisation
      return "Erreur de configuration de votre compte utilisateur. Vous n'avez accès à aucun hôpital. Contacter l'administrateur."
    }
    if (isUserOfOnlyOneHospital(currentUser) && currentUser.hospital?.id !== hospitalId) {
      setError("Vous n'êtes pas autorisé à voir les ETP de cet établissement.")
    } else if (!isUserOfOnlyOneHospital(currentUser) && !scopeUser.includes(hospitalId)) {
      setError("Vous n'êtes pas autorisé à voir les ETP de cet établissement.")
    } else {
      setEmploymentDataMonths(composeEmploymentDataMonth({ currentMonth, currentYear, hospitalId, selectedYear }))
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
