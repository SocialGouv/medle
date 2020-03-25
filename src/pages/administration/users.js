import React, { useState } from "react"
import Link from "next/link"
import { PropTypes } from "prop-types"
import { Alert, Col, Form, FormGroup, Input, Spinner, Table, Container } from "reactstrap"
import Layout from "../../components/LayoutAdmin"

import { Button, Title1 } from "../../components/StyledComponents"
import { buildAuthHeaders, redirectIfUnauthorized, withAuthentication } from "../../utils/auth"
import { API_URL, ACT_USERS_ENDPOINT } from "../../config"
import { handleAPIResponse } from "../../utils/errors"
import { logError } from "../../utils/logger"
import { ADMIN, ROLES_DESCRIPTION } from "../../utils/roles"
import { usePaginatedData } from "../../utils/hooks"
import Pagination from "../../components/Pagination"
import EditAttributesIcon from "@material-ui/icons/EditAttributes"

const fetchData = async ({ search, requestedPage, authHeaders }) => {
   const arr = []
   if (search) {
      arr.push(`fuzzy=${search}`)
   }
   if (requestedPage) {
      arr.push(`requestedPage=${requestedPage}`)
   }
   const bonus = arr.length ? "?" + arr.join("&") : ""
   const response = await fetch(`${API_URL}${ACT_USERS_ENDPOINT}${bonus}`, { headers: authHeaders })

   return handleAPIResponse(response)
}

const AdminUserPage = ({ paginatedData: initialPaginatedData, currentUser }) => {
   const [search, setSearch] = useState("")
   const [paginatedData, error, loading, fetchPage] = usePaginatedData(fetchData, initialPaginatedData)

   const onChange = e => {
      setSearch(e.target.value)
   }

   const onSubmit = e => {
      e.preventDefault()
      fetchPage(search)(0)
   }

   return (
      <Layout currentUser={currentUser}>
         <Title1 className="mt-5 mb-4">{"Utilisateurs"}</Title1>

         <Container style={{ maxWidth: 980 }}>
            <Form onSubmit={onSubmit}>
               <FormGroup row inline className="justify-content-center mb-4">
                  <Col className="ml-auto" sm="9">
                     <Input
                        type="text"
                        name="es"
                        id="es"
                        placeholder="Rechercher un utilisateur par nom, prénom, email.."
                        value={search}
                        onChange={onChange}
                        autoComplete="off"
                     />
                  </Col>
                  <Col sm="3" className="text-center mt-4 mt-sm-0">
                     <Button className="w-lg-75" disabled={loading}>
                        {loading ? <Spinner size="sm" color="light" data-testid="loading" /> : "Chercher"}
                     </Button>
                  </Col>
               </FormGroup>
            </Form>
            {error && (
               <Alert color="danger" className="mb-4">
                  {error}
               </Alert>
            )}
            {!error && !paginatedData.elements.length && (
               <div className="text-center">{"Aucun utilisateurs trouvés."}</div>
            )}

            {!error && !!paginatedData.elements.length && (
               <>
                  <Pagination data={paginatedData} fn={fetchPage(search)} />
                  <Table responsive className="table-hover">
                     <thead>
                        <tr className="table-light">
                           <th>Nom</th>
                           <th>Email</th>
                           <th>Role</th>
                           <th>Établissement</th>
                           <th></th>
                        </tr>
                     </thead>
                     <tbody>
                        {paginatedData.elements.map(user => (
                           <tr key={user.id}>
                              <td>
                                 <b>{`${user.firstName} ${user.lastName}`}</b>
                              </td>
                              <td>{user.email}</td>
                              <td>{user.role && ROLES_DESCRIPTION[user.role]}</td>
                              <td>{user.hospital && user.hospital.name}</td>
                              <td>
                                 <Link href="/administration/userDetail/[id]" as={`/user/${user.id}`}>
                                    <a>
                                       Voir détail&nbsp;
                                       <EditAttributesIcon />
                                    </a>
                                 </Link>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </Table>
               </>
            )}
         </Container>
      </Layout>
   )
}

AdminUserPage.getInitialProps = async ctx => {
   const authHeaders = buildAuthHeaders(ctx)

   try {
      const paginatedData = await fetchData({ authHeaders })
      return { paginatedData }
   } catch (error) {
      logError("APP error", error)

      redirectIfUnauthorized(error, ctx)
   }
   return {}
}

AdminUserPage.propTypes = {
   paginatedData: PropTypes.object,
   currentUser: PropTypes.object.isRequired,
}

export default withAuthentication(AdminUserPage, ADMIN)
