import React from "react"
import PropTypes from "prop-types"

export const InputError = ({ children }) => {
  return (
    <span role="alert" className="text-red-500">
      <span role="img" aria-label="Warning">
        ⚠️
      </span>{" "}
      {children}
    </span>
  )
}

InputError.propTypes = {
  children: PropTypes.node,
}
