import React, { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import PropTypes from "prop-types"
import fetch from "isomorphic-unfetch"
import { Button, Col, Row, Alert, Container, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"
import EditOutlinedIcon from "@material-ui/icons/EditOutlined"
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined"

import { FORMAT_DATE } from "../../../utils/date"
import { API_URL, ADMIN_USERS_ENDPOINT } from "../../../config"
import Layout from "../../../components/Layout"
import ColumnAct from "../../../components/ColumnAct"
import { Title1, Title2 } from "../../../components/StyledComponents"
import { isEmpty } from "../../../utils/misc"
import { handleAPIResponse } from "../../../utils/errors"
import { buildAuthHeaders, redirectIfUnauthorized, withAuthentication } from "../../../utils/auth"
import { isAllowed, ADMIN } from "../../../utils/roles"
import { logError } from "../../../utils/logger"
import { profiles } from "../../../utils/actsConstants"

const UserDetail = ({ initialAct: act, id, error, currentUser }) => {}

UserDetail.getInitialProps = async ctx => {
   const authHeaders = buildAuthHeaders(ctx)

   const { id } = ctx.query

   let json
   try {
      const response = await fetch(API_URL + ADMIN_USERS_ENDPOINT + "/" + id, { headers: authHeaders })
      json = await handleAPIResponse(response)
      return { initialAct: json, id }
   } catch (error) {
      logError(error)
      redirectIfUnauthorized(error, ctx)

      return { error: "Erreur serveur" }
   }
}

UserDetail.propTypes = {
   initialAct: PropTypes.object,
   id: PropTypes.string,
   error: PropTypes.string,
   currentUser: PropTypes.object.isRequired,
}

export default withAuthentication(UserDetail, ADMIN)
