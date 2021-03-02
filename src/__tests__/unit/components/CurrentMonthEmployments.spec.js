import * as nextRouter from "next/router"
import React from "react"
import { render, screen, waitFor } from "@testing-library/react"

import { CurrentMonthEmployments } from "../../../components/EmploymentMonthData"
import { SUPER_ADMIN } from "../../../utils/roles"
import * as auth from "../../../utils/auth"
import * as clientsEmployment from "../../../clients/employments"
import * as clientsReference from "../../../clients/employments-references"

jest.spyOn(auth, "getCurrentUser")
jest.spyOn(clientsEmployment, "findEmployment")
jest.spyOn(clientsReference, "searchReferenceForMonth")

const lambdaUser = {
    id: 3,
    role: SUPER_ADMIN,
    hospital: { id: 3 },
}

const lambdaEmployments = {
    ides: "3.3",
    auditoriumAgents: "1",
    others: "2",
    doctors: "11.9",
    secretaries: "1.9",
    nursings: "4.15",
    executives: "1",
}

const lambdaReferences = {
    reference: {
        ides: "0.5",
        auditoriumAgents: "1",
        others: "1.5",
        doctors: "0",
        secretaries: "0",
        nursings: "0",
        executives: "0",
    },
}

const lambdaMonth = "03"
const lambdaYear = 2021
const lambdaHospitalId = 3

beforeEach(() => {
    auth.getCurrentUser.mockImplementation(async () => lambdaUser)
    clientsEmployment.findEmployment.mockImplementation(async () => lambdaEmployments)
    clientsReference.searchReferenceForMonth.mockImplementation(async () => lambdaReferences)
})

afterEach(() => {
    auth.getCurrentUser.mockRestore()
    clientsEmployment.findEmployment.mockRestore()
    clientsReference.searchReferenceForMonth.mockRestore()
})

it("should render CurrentMonthEmployments", async () => {
    await waitFor(() => render(<CurrentMonthEmployments month={lambdaMonth} year={lambdaYear} hospitalId={lambdaHospitalId} />))

    expect(screen.getByLabelText(/secrétaire/i)).toHaveValue(1.9)
    expect(screen.getByLabelText(/reference.others/i).textContent).toMatchInlineSnapshot(`"1.5 ETP prévus"`)

    expect(auth.getCurrentUser).toHaveBeenCalled()
    expect(clientsEmployment.findEmployment).toHaveBeenCalled()
    expect(clientsReference.searchReferenceForMonth).toHaveBeenCalled()

})
