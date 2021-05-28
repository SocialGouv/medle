import fetch from "isomorphic-unfetch"
import moize from "moize"

import { API_URL, ATTACKS_ENDPOINT } from "../config"
import { handleAPIResponse2 } from "../utils/errors"
import { METHOD_DELETE, METHOD_POST, METHOD_PUT } from "../utils/http"


export const searchAttacksFuzzy = async ({ search, requestedPage, headers }) => {
  const arr = [];
  if (search) {
    arr.push(`fuzzy=${search}`);
  }
  if (requestedPage) {
    arr.push(`requestedPage=${requestedPage}`);
  }
  const bonus = arr.length ? "?" + arr.join("&") : "";

  const response = await fetch(`${API_URL}${ATTACKS_ENDPOINT}${bonus}`, { headers });
  return handleAPIResponse2(response);
}

export const findAttack = async ({ id, headers }) => {
  const response = await fetch(`${API_URL}${ATTACKS_ENDPOINT}/${id}`, { headers })
  return handleAPIResponse2(response)
}

export const findAllAttacks = async ({ headers } = {}) => {
  const response = await fetch(API_URL + ATTACKS_ENDPOINT, { headers })
  return handleAPIResponse2(response)
}


export const createAttack = async ({ attack, headers }) => {
  const response = await fetch(`${API_URL}${ATTACKS_ENDPOINT}`, {
    method: METHOD_POST,
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(attack),
  })

  return handleAPIResponse2(response)
}

export const updateAttack = async ({ attack, headers }) => {
  const response = await fetch(`${API_URL}${ATTACKS_ENDPOINT}/${attack.id}`, {
    method: METHOD_PUT,
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(attack),
  })
  return handleAPIResponse2(response)
}

export const deleteAttack = async ({ id, headers }) => {
  const response = await fetch(`${API_URL}${ATTACKS_ENDPOINT}/${id}`, { method: METHOD_DELETE, headers })
  return handleAPIResponse2(response)
}