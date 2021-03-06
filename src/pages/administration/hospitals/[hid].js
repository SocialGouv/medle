import { yupResolver } from "@hookform/resolvers"
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos"
import Link from "next/link"
import { useRouter } from "next/router"
import PropTypes from "prop-types"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap"
import * as yup from "yup"

import { createHospital, deleteHospital, findHospital, updateHospital } from "../../../clients/hospitals"
import Layout from "../../../components/Layout"
import { Title1, Title2 } from "../../../components/StyledComponents"
import { buildAuthHeaders, redirectIfUnauthorized, withAuthentication } from "../../../utils/auth"
import { logDebug, logError } from "../../../utils/logger"
import { isEmpty } from "../../../utils/misc"
import { ADMIN } from "../../../utils/roles"

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
  const { id } = hospital

  const { handleSubmit, register, errors: formErrors, setValue, watch } = useForm({
    defaultValues: {
      ...hospital,
    },
    resolver: yupResolver(schema),
  })

  const formId = watch("id")

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
        setError("Erreur serveur.")
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
      <Container
        style={{ maxWidth: 980, minWidth: 740 }}
        className="mt-5 mb-5 d-flex justify-content-between align-items-baseline"
      >
        <div className="d-flex justify-content-between">
          <Link href="/administration/hospitals">
            <a>
              <ArrowBackIosIcon width={30} style={{ width: 15 }} />
              Retour
            </a>
          </Link>
        </div>
        <Title1>Hôpital {hospital?.name}</Title1>

        {id ? (
          <Link href="/administration/hospitals/[hid]/employments" as={`/administration/hospitals/${id}/employments`}>
            <Button outline color="primary">
              <a>Gérer les ETP de référence</a>
            </Button>
          </Link>
        ) : (
            <span />
          )}
      </Container>

      <Container style={{ maxWidth: 980, minWidth: 740 }}>
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
              <Link href="/administration/hospitals/[hid]" as={`/administration/hospitals/new`}>
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
              <Input type="text" name="id" id="id" readOnly innerRef={register} />
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
              {formId ? "Modifier" : "Ajouter"}
            </Button>
          </div>
          {formId && (
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

  const { hid } = ctx.query

  if (!hid || isNaN(hid)) return { hospital: {}, key: Number(new Date()) }

  try {
    const hospital = await findHospital({ id: hid, headers })

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
