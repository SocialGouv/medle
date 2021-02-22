import Link from "next/link"
import PropTypes from "prop-types"
import React from "react"
import Select from "react-select"
import { Alert, Container } from "reactstrap"

import EmploymentMonthData from "../components/EmploymentMonthData"
import Layout from "../components/Layout"
import { Title1, Title2 } from "../components/StyledComponents"
import { getCurrentUser, redirectIfUnauthorized, withAuthentication } from "../utils/auth"
import { NAME_MONTHS, now } from "../utils/date"
import { logError } from "../utils/logger"
import { EMPLOYMENT_CONSULTATION } from "../utils/roles"

function composeEmploymentDataMonth({ currentYear, currentMonth, selectedYear, currentUser }) {
  if (currentYear === selectedYear) {
    return [
      <EmploymentMonthData
        key={currentMonth}
        month={currentMonth}
        year={selectedYear}
        currentUser={currentUser}
        readOnly={false}
        isCurrentMonth={true}
      />,
      Array(Number(currentMonth - 1))
        .fill(0)
        .map((_, index) => String(index + 1).padStart(2, "0"))
        .reverse()
        .map((month) => (
          <EmploymentMonthData
            key={month}
            month={month}
            year={selectedYear}
            currentUser={currentUser}
            readOnly={true}
          />
        )),
    ]
  }

  return Array(12)
    .fill(0)
    .map((_, index) => String(index + 1).padStart(2, "0"))
    .reverse()
    .map((month) => (
      <EmploymentMonthData key={month} month={month} year={selectedYear} currentUser={currentUser} readOnly={true} />
    ))
}

const EmploymentsPage = ({ currentUser }) => {
  const moment = now()
  const currentMonth = moment.format("MM")
  const currentYear = Number(moment.format("YYYY"))

  const [selectedYear, setSelectedYear] = React.useState(currentYear)
  const [employmentDataMonths, setEmploymentDataMonths] = React.useState(
    composeEmploymentDataMonth({ currentYear, currentMonth, selectedYear, currentUser })
  )

  const title = selectedYear === currentYear ? NAME_MONTHS[currentMonth] + " " + selectedYear : `Année ${selectedYear}`

  React.useEffect(() => {
    setEmploymentDataMonths(composeEmploymentDataMonth({ currentYear, currentMonth, selectedYear, currentUser }))
  }, [currentYear, currentMonth, selectedYear, currentUser])

  const { hospital } = currentUser

  const START_YEAR_MEDLE = 2020

  const yearsOptions = Array(currentYear - START_YEAR_MEDLE + 1)
    .fill(0)
    .map((_, index) => START_YEAR_MEDLE + index)
    .reverse()
    .map((current) => ({ label: current, value: current }))

  if (!hospital?.id)
    return (
      <Layout page="employments" currentUser={currentUser}>
        <Title1 className="mt-5 mb-5">{"Déclaration du personnel"}</Title1>

        <Container style={{ maxWidth: 720 }}>
          <Title2 className="mb-4 text-capitalize">{title}</Title2>
          <Alert color="danger">
            {"Cette fonctionnalité n'est disponible que si vous avez un établissement d'appartenance."}
          </Alert>
        </Container>
      </Layout>
    )

  function handleYearChange(option) {
    setSelectedYear(option.value)
  }

  return (
    <Layout page="employments" currentUser={currentUser}>
      <div className="d-flex flex-column flex-md-row justify-content-center align-items-center">
        <Title1 className="mt-5 mb-2 mb-md-5 mr-5">{"Déclaration du personnel"}</Title1>
        <div className="flex-grow-1 mb-3 mb-md-0" style={{ maxWidth: 100 }}>
          <Select options={yearsOptions} defaultValue={yearsOptions[0]} onChange={handleYearChange} />
        </div>
      </div>
      <Container style={{ maxWidth: 720 }}>
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
      </Container>
    </Layout>
  )
}

EmploymentsPage.getInitialProps = async (ctx) => {
  try {
    const currentUser = getCurrentUser(ctx)

    const { hospital } = currentUser

    if (!hospital || !hospital.id) {
      throw new Error("Vous n'avez pas d'établissement de santé à gérer.")
    }

    return {
      currentUser,
    }
  } catch (error) {
    logError(error)

    redirectIfUnauthorized(error, ctx)
  }
}

EmploymentsPage.propTypes = {
  currentUser: PropTypes.object,
}

export default withAuthentication(EmploymentsPage, EMPLOYMENT_CONSULTATION)
