import { searchAskersFuzzy } from "../../clients/askers"
import { authenticate } from "../../clients/authentication"

const headersActUserTours = () => authenticate("acte@tours.fr", "test")

describe("/askers", () => {
  it("should return all criminal courts in France", async () => {
    const { headers } = await headersActUserTours()

    const askers = await searchAskersFuzzy({ search: "Montargis", headers })

    expect(askers).toMatchSnapshot()
  })
})
