import { logError } from "../utils/logger"
import { APIError } from "../utils/errors"
import { STATUS_400_BAD_REQUEST } from "../utils/http"
import { revertObject } from "../utils/misc"

const configValidate = {
  strict: false,
  abortEarly: false,
}

export const validate = (schema) => async (model) => {
  try {
    const value = await schema.validate(model, configValidate)
    return value
  } catch (error) {
    logError(error)
    throw new APIError({
      status: STATUS_400_BAD_REQUEST,
      message: "Bad request",
      detail: error.inner && error.inner.map((err) => [err.path, err.message]),
    })
  }
}

// TODO supprimer si pas utilisé ?
export const cast = (schema) => async (model) => await schema.cast(model)

// Transform a Knex model into JS model
export const transform = (JStoDBKeys) => (modelDB) => {
  if (!modelDB) return null

  const DBtoJSKeys = revertObject(JStoDBKeys)

  // add extra_data first so regular fields can't be overriden by bad luck
  const res = { ...modelDB.extra_data }

  for (const [keyDB, value] of Object.entries(modelDB)) {
    if (keyDB !== "extra_data") {
      const key = DBtoJSKeys[keyDB]
      res[key] = value
    }
  }

  return res
}

export const transformAll = (transform) => (list) => list.map((model) => transform(model))

// Transform a JS model into Knex model
export const untransform = (JStoDBKeys) => (modelJS) => {
  if (!modelJS) return null

  const knexData = { extra_data: {} }

  for (const [key, value] of Object.entries(modelJS)) {
    const keyDB = JStoDBKeys[key]

    if (keyDB) {
      knexData[keyDB] = value
    } else {
      knexData.extra_data[key] = value
    }
  }

  // Pas d'id pour une création de user
  if (!modelJS.id) delete knexData.id

  return knexData
}

export const build = ({ JStoDBKeys, schema }) => {
  const innerTransform = transform(JStoDBKeys)

  return {
    // Transform a Knex model into JS model
    transform: innerTransform,
    transformAll: transformAll(innerTransform),
    // Transform a JS model into Knex model
    untransform: untransform(JStoDBKeys),
    validate: validate(schema),
    cast: cast(schema),
  }
}
