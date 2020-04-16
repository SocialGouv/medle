import React, { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import PropTypes from "prop-types"
import { Button, Col, Row, Alert, Container, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"
import EditOutlinedIcon from "@material-ui/icons/EditOutlined"
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined"

import { isoToFr } from "../../utils/date"
import Layout from "../../components/Layout"
import ColumnAct from "../../components/ColumnAct"
import { Title1, Title2 } from "../../components/StyledComponents"
import { isEmpty } from "../../utils/misc"
import { buildAuthHeaders, redirectIfUnauthorized, withAuthentication } from "../../utils/auth"
import { logDebug, logError } from "../../utils/logger"
import { isAllowed, ACT_CONSULTATION, ACT_MANAGEMENT } from "../../utils/roles"

import { profiles } from "../../utils/actsConstants"
import { deleteAct, findAct } from "../../clients/acts"

const ActDetail = ({ initialAct: act, id, error, currentUser }) => {
   const router = useRouter()
   const [isError, setIsError] = useState(error)

   const [modal, setModal] = useState(false)
   const toggle = () => setModal(!modal)

   const getProfiledRender = ({ profile, act }) => {
      return profiles[profile].read(act)
   }

   const onDeleteAct = () => {
      toggle()

      const del = async id => {
         try {
            const { deleted } = await deleteAct({ id })
            logDebug(`Nb deleted rows: ${deleted}`)

            router.push("/acts")
         } catch (error) {
            logError(error)
            setIsError(error)
         }
      }

      del(id)
   }

   const editAct = id => {
      return router.push(`/acts/declaration?id=${id}`)
   }

   return (
      <Layout page="acts" currentUser={currentUser}>
         <Title1 className="mt-5 mb-5">{`Acte n° ${(act && act.internalNumber) || ""}`}</Title1>

         {!isEmpty(isError) && (
            <Container style={{ maxWidth: 780 }}>
               <Alert color="danger" className="mt-5 mb-5">
                  {isError || "Erreur serveur"}
               </Alert>
            </Container>
         )}
         {isEmpty(isError) && (
            <>
               <Container style={{ maxWidth: 780 }}>
                  <div className="px-2 py-2">
                     <Title2 className="mt-3 mb-4">{"Identification de l'acte"}</Title2>
                     <Row>
                        <Col className="mr-3">
                           <ColumnAct header={"Numéro de PV"} content={act && act.pvNumber} />
                        </Col>{" "}
                        <Col className="mr-3">
                           <ColumnAct header={"Demandeur"} content={act && act.asker && act.asker.name} />
                        </Col>
                        <Col className="mr-3">
                           <ColumnAct
                              header={"Date"}
                              content={act && act.examinationDate && isoToFr(act.examinationDate)}
                           />
                        </Col>
                        <Col className="mr-3">
                           {act && act.periodOfDay && (
                              <ColumnAct header={"Créneau horaire"} content={act.periodOfDay} />
                           )}
                        </Col>
                     </Row>
                     {getProfiledRender({ profile: act.profile, act })}
                  </div>
               </Container>

               <Container style={{ maxWidth: 780 }} className="mt-4">
                  {isAllowed(currentUser.role, ACT_MANAGEMENT) && (
                     <Row>
                        <Col>
                           <Button block outline color="danger" onClick={toggle}>
                              <DeleteForeverOutlinedIcon width={24} />
                              {" Supprimer l'acte"}
                           </Button>
                        </Col>
                        <Col>
                           <Button block outline color="info" onClick={() => editAct(id)}>
                              <EditOutlinedIcon width={24} />
                              {" Modifier l'acte"}
                           </Button>
                           <div>
                              <Modal isOpen={modal} toggle={toggle}>
                                 <ModalHeader toggle={toggle}>Voulez-vous vraiment supprimer cet acte?</ModalHeader>
                                 <ModalBody>
                                    Si vous supprimez cet acte, il ne serait plus visible ni modifiable dans la liste
                                    des actes. Merci de confirmer votre choix.
                                 </ModalBody>
                                 <ModalFooter>
                                    <Button color="primary" onClick={onDeleteAct}>
                                       Supprimer
                                    </Button>{" "}
                                    <Button color="secondary" onClick={toggle}>
                                       Annuler
                                    </Button>
                                 </ModalFooter>
                              </Modal>
                           </div>
                        </Col>
                     </Row>
                  )}
                  <div className="mt-5 text-center">
                     <Link href="/acts">
                        <a>Retour à la liste des actes</a>
                     </Link>
                  </div>
               </Container>
            </>
         )}
      </Layout>
   )
}

ActDetail.getInitialProps = async ctx => {
   const headers = buildAuthHeaders(ctx)
   const { id } = ctx.query

   try {
      const act = await findAct({ id, headers })

      return { initialAct: act, id }
   } catch (error) {
      logError(error)
      redirectIfUnauthorized(error, ctx)

      const message = error.status && error.status === 404 ? "L'acte n'a pu être trouvé." : "Erreur serveur."

      return { error: message }
   }
}

ActDetail.propTypes = {
   initialAct: PropTypes.object,
   id: PropTypes.string,
   error: PropTypes.string,
   currentUser: PropTypes.object.isRequired,
}

export default withAuthentication(ActDetail, ACT_CONSULTATION)