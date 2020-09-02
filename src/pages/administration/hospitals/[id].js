import React, { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import PropTypes from "prop-types"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers"
import {
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
import { useForm } from "react-hook-form"
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos"

import Layout from "../../../components/Layout"
import { Title1, Title2 } from "../../../components/StyledComponents"
import { isEmpty } from "../../../utils/misc"
import { buildAuthHeaders, redirectIfUnauthorized, withAuthentication } from "../../../utils/auth"
import { ADMIN } from "../../../utils/roles"
import { logError, logDebug } from "../../../utils/logger"
import { createHospital, deleteHospital, findHospital, updateHospital } from "../../../clients/hospitals"

const MandatorySign = () => <span style={{ color: "red" }}>*</span>

const schema = yup.object({
  finesseNumber: yup.string(),
  name: yup.string().required("Le nom est obligatoire."),
  addr1: yup.string(),
  addr2: yup.string(),
  town: yup.string().required("La ville est obligatoire."),
  depCode: yup
    .string()
    .required("Le département est obligatoire.")
    .matches(/^2A|2B|[0-9]{2,3}$/i, "Le département a un format incorrect."),
  postalCode: yup.string().matches(/^[0-9]{5}$/i, "Le code postal a un format incorrect."),
  etp: yup.object({
    doctors: yup.number().typeError("Le nombre d'ETP est incorrect."),
    secretaries: yup.number().typeError("Le nombre d'ETP est incorrect."),
    nursings: yup.number().typeError("Le nombre d'ETP est incorrect."),
    executives: yup.number().typeError("Le nombre d'ETP est incorrect."),
    ides: yup.number().typeError("Le nombre d'ETP est incorrect."),
    auditoriumAgents: yup.number().typeError("Le nombre d'ETP est incorrect."),
    others: yup.number().typeError("Le nombre d'ETP est incorrect."),
  }),
})

// TODO : vérifier que seul le super admin puisse accéder à cette page
const HospitalDetail = ({ hospital = {}, currentUser, error: initialError }) => {
  const router = useRouter()
  const { id } = router.query
  const { handleSubmit, register, errors: formErrors, setValue } = useForm({
    defaultValues: {
      ...hospital,
    },
    resolver: yupResolver(schema),
  })

  // General error (alert)
  const [error, setError] = useState(initialError)
  // Fields errors, for those not managed by useForm
  const [success, setsuccess] = useState("")
  const [modal, setModal] = useState(false)

  const toggle = () => setModal(!modal)

  React.useEffect(() => {
    if (formErrors) setsuccess("")
  }, [formErrors, setsuccess])

  const onDeleteHospital = () => {
    toggle()

    const del = async (id) => {
      try {
        const { deleted } = await deleteHospital({ id })
        logDebug(`Nb deleted rows: ${deleted}`)
        router.push("/administration/hospitals")
      } catch (error) {
        setError(error)
      }
    }

    del(id)
  }

  const onSubmit = async (hospital) => {
    setError("")
    setsuccess("")

    try {
      if (isEmpty(formErrors)) {
        if (hospital.id) {
          const { updated } = await updateHospital({ hospital })
          logDebug(`Nb updated rows: ${updated}`)
          setsuccess("Hôpital modifié.")
        } else {
          hospital.id = null
          const { id } = await createHospital({ hospital })
          setValue("id", id || "")
          setsuccess("Hôpital créé.")
        }
      }
    } catch (error) {
      setError("Erreur serveur.")
    }
  }

  return (
    <Layout page="hospitals" currentUser={currentUser} admin={true}>
      <Container style={{ maxWidth: 720 }} className="mt-5 mb-4">
        <div className="d-flex justify-content-between">
          <Link href="/administration/hospitals">
            <a>
              <ArrowBackIosIcon width={30} style={{ width: 15 }} />
              Retour
            </a>
          </Link>
          <Title1>{"Hôpital"}</Title1>
          <span>&nbsp;</span>
        </div>

        {error && <Alert color="danger mt-4">{error}</Alert>}

        {success && (
          <Alert color="success" className="d-flex justify-content-between align-items-center mt-4">
            {success}&nbsp;
            <div>
              <Link href="/administration/hospitals">
                <Button className="mr-3" outline color="success">
                  <a>Retour à la liste</a>
                </Button>
              </Link>
              <Link href="/administration/hospitals/[id]" as={`/administration/hospitals/new`}>
                <Button outline color="success">
                  <a>Ajouter</a>
                </Button>
              </Link>
            </div>
          </Alert>
        )}

        <Form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <FormGroup row>
            <Label for="id" sm={3}>
              Id
            </Label>
            <Col sm={9}>
              <Input type="text" name="id" id="id" disabled innerRef={register} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="finesseNumber" sm={3}>
              N° Finess
            </Label>
            <Col sm={9}>
              <Input type="text" name="finesseNumber" id="finesseNumber" innerRef={register} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="name" sm={3}>
              Nom&nbsp;
              <MandatorySign />
            </Label>
            <Col sm={9}>
              <Input type="text" name="name" id="name" invalid={!!formErrors.name} innerRef={register} />
              <FormFeedback>{formErrors.name?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="addr1" sm={3}>
              Adresse 1&nbsp;
            </Label>
            <Col sm={9}>
              <Input type="text" name="addr1" id="addr1" innerRef={register} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="addr2" sm={3}>
              Adresse 2&nbsp;
            </Label>
            <Col sm={9}>
              <Input type="text" name="addr2" id="addr2" innerRef={register} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="town" sm={3}>
              Ville&nbsp;
              <MandatorySign />
            </Label>
            <Col sm={9}>
              <Input type="text" name="town" id="town" invalid={!!formErrors.town} innerRef={register} />
              <FormFeedback>{formErrors.town?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="depCode" sm={3}>
              Département&nbsp;
              <MandatorySign />
            </Label>
            <Col sm={9}>
              <Input
                type="text"
                name="depCode"
                id="depCode"
                innerRef={register}
                invalid={!!formErrors.depCode}
                placeholder="Ex: 44 ou 971"
              />
              <FormFeedback>{formErrors.depCode?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="postalCode" sm={3}>
              Code postal&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="text"
                name="postalCode"
                id="postalCode"
                innerRef={register}
                invalid={!!formErrors.postalCode}
                placeholder="Ex: 94300"
              />
              <FormFeedback>{formErrors.postalCode?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <Title2 className="mt-4 mb-3">Paramètres ETP</Title2>
          <div className="mb-3">
            <i>Veuillez renseigner les ETP de référence pour cet établissement.</i>{" "}
          </div>
          <FormGroup row>
            <Label for="etp.doctors" sm={3}>
              Médecins&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="etp.doctors"
                id="etp.doctors"
                innerRef={register}
                invalid={!!formErrors.etp?.doctors}
                min={0}
                defaultValue={0}
              />

              <FormFeedback>{formErrors.etp?.doctors?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="etp.secretaries" sm={3}>
              Secrétaires&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="etp.secretaries"
                id="etp.secretaries"
                innerRef={register}
                invalid={!!formErrors.etp?.secretaries}
                min={0}
                defaultValue={0}
              />
              <FormFeedback>{formErrors.etp?.secretaries?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="etp.nursings" sm={3}>
              Aide soignant.e&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="etp.nursings"
                id="etp.nursings"
                innerRef={register}
                invalid={!!formErrors.etp?.nursings}
                min={0}
                defaultValue={0}
              />
              <FormFeedback>{formErrors.etp?.nursings?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="etp.executives" sm={3}>
              Cadre de santé&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="etp.executives"
                id="etp.executives"
                innerRef={register}
                invalid={!!formErrors.etp?.executives}
                min={0}
                defaultValue={0}
              />
              <FormFeedback>{formErrors.etp?.executives?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="etp.ides" sm={3}>
              IDE&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="etp.ides"
                id="etp.ides"
                innerRef={register}
                invalid={!!formErrors.etp?.ides}
                min={0}
                defaultValue={0}
              />
              <FormFeedback>{formErrors.etp?.ides?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="etp.auditoriumAgents" sm={3}>
              {"Agent d'amphithéâtre"}&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="etp.auditoriumAgents"
                id="etp.auditoriumAgents"
                innerRef={register}
                invalid={!!formErrors.etp?.auditoriumAgents}
                min={0}
                defaultValue={0}
              />
              <FormFeedback>{formErrors.etp?.auditoriumAgents?.message}</FormFeedback>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="etp.others" sm={3}>
              Autres&nbsp;
            </Label>
            <Col sm={9}>
              <Input
                type="number"
                autoComplete="off"
                name="etp.others"
                id="etp.others"
                innerRef={register}
                invalid={!!formErrors.etp?.others}
                min={0}
                defaultValue={0}
              />
              <FormFeedback>{formErrors.etp?.others?.message}</FormFeedback>
            </Col>
          </FormGroup>

          <Title2 className="mt-4 mb-3">Paramètres actes</Title2>
          <FormGroup row>
            <Label for="canDoPostMortem" sm={3}>
              Autopsies autorisées&nbsp;?&nbsp;
              <MandatorySign />
            </Label>
            <Col sm={9}>
              <Input
                type="checkbox"
                name="canDoPostMortem"
                id="canDoPostMortem"
                invalid={!!formErrors.canDoPostMortem}
                innerRef={register}
                className="mt-3 ml-0"
              />
            </Col>
          </FormGroup>

          <div className="justify-content-center d-flex">
            <Link href="/administration/hospitals">
              <Button className="px-4 mt-5 mr-3" outline color="primary">
                Annuler
              </Button>
            </Link>
            <Button className="px-4 mt-5 " color="primary">
              {isEmpty(hospital) ? "Ajouter" : "Modifier"}
            </Button>
          </div>
          {!isEmpty(hospital) && (
            <div style={{ border: "1px solid tomato" }} className="px-4 py-3 mt-5 rounded">
              <Title1 className="mb-4">Zone dangereuse</Title1>
              <div className="d-flex justify-content-between align-items-center">
                Je souhaite supprimer cet hôpital
                <Button className="" color="danger" outline onClick={toggle}>
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </Form>
        <div>
          <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>Voulez-vous vraiment supprimer cet hôpital?</ModalHeader>
            <ModalBody>
              Si vous supprimez cet hôpital, il ne serait plus visible ni modifiable dans la liste des hôpitaux. Merci
              de confirmer votre choix.
            </ModalBody>
            <ModalFooter>
              <Button color="primary" outline onClick={toggle}>
                Annuler
              </Button>
              <Button color="danger" onClick={onDeleteHospital}>
                Supprimer
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </Container>
    </Layout>
  )
}

HospitalDetail.getInitialProps = async (ctx) => {
  const headers = buildAuthHeaders(ctx)

  const { id } = ctx.query

  if (!id || isNaN(id)) return { hospital: {}, key: Number(new Date()) }

  try {
    const hospital = await findHospital({ id, headers })
    return { hospital }
  } catch (error) {
    logError(error)
    redirectIfUnauthorized(error, ctx)

    return { error: "Erreur serveur" }
  }
}

HospitalDetail.propTypes = {
  hospital: PropTypes.object,
  currentUser: PropTypes.object.isRequired,
  error: PropTypes.string,
}

export default withAuthentication(HospitalDetail, ADMIN)
