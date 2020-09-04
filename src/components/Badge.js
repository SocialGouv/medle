import React from "react"
import PropTypes from "prop-types"

const Badge = ({ value }) =>
  !value ? null : (
    <div className="text-center">
      <div className="mt-2 border rounded-pill small py-1" style={{ backgroundColor: "#307df6", color: "white" }}>
        {value}
      </div>
    </div>
  )

Badge.propTypes = {
  value: PropTypes.number,
}

export default Badge
