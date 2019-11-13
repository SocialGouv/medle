import React, { useState } from "react"
import PropTypes from "prop-types"
import { ButtonDropdown, Col, DropdownItem, DropdownMenu, Row } from "reactstrap"

import { Button, DropdownToggle, Title2 } from "./StyledComponents"

const makeColOptions = values => {
   if (values.length) {
      if (values.length === 1) {
         return {
            sm: 3,
         }
      } else if (values.length >= 4) {
         return {
            sm: 3,
         }
      }
   }
   return {}
}

const isSelected = (stateType, val) => {
   if (stateType instanceof Array) {
      return stateType.includes(val) ? 1 : 0
   } else {
      return stateType === val ? 1 : 0
   }
}

const hasCommonElement = (prefix, stateTypes, subValues) => {
   if (!(stateTypes instanceof Array) || !(subValues instanceof Array)) return false

   for (let i = 0; i < stateTypes.length; i++) {
      for (let j = 0; j < subValues.length; j++) {
         if (stateTypes[i] === prefix + "/" + subValues[j]) return stateTypes[i]
      }
   }
   return false
}

const ActBlock = ({ title, subTitle, type, values, dispatch, state, invalid }) => {
   const [dropdownOpen, setOpen] = useState(false)
   const toggle = () => setOpen(!dropdownOpen)

   const colOptions = makeColOptions(values)
   const colorOptions = invalid ? { color: "red" } : {}

   return (
      <>
         {title && (
            <Title2 className="mb-4 mt-5" style={colorOptions}>
               {title}
            </Title2>
         )}

         {subTitle && (
            <Row className="mt-3">
               <Col sm={4} className="mb-1" style={colorOptions}>
                  {subTitle}
               </Col>
            </Row>
         )}

         <Row>
            {values.map((val, index) => {
               if (val.subValues) {
                  const commonElement = hasCommonElement(val.title, state[type], val.subValues)
                  return (
                     <Col key={index} {...colOptions} className="mb-4">
                        <ButtonDropdown className="btn-block" isOpen={dropdownOpen} toggle={toggle}>
                           <DropdownToggle outline color="secondary" invert={commonElement ? 1 : 0} caret>
                              {commonElement ? commonElement : val.title}
                           </DropdownToggle>
                           <DropdownMenu>
                              {val.subValues.map((sub, indexS) => (
                                 <DropdownItem
                                    key={indexS}
                                    onClick={() => dispatch({ type, payload: val.title + "/" + sub })}
                                 >
                                    {sub}
                                 </DropdownItem>
                              ))}
                           </DropdownMenu>
                        </ButtonDropdown>
                     </Col>
                  )
               } else if (val.subTitle) {
                  return (
                     <Col key={index} {...colOptions} className="mb-4">
                        <Button
                           outline
                           color="secondary"
                           block
                           invert={isSelected(state[type], val.title)}
                           onClick={() => dispatch({ type, payload: val.title })}
                        >
                           {val.title}
                           <br />
                           {val.subTitle}
                        </Button>
                     </Col>
                  )
               } else
                  return (
                     <Col key={index} {...colOptions} className="mb-4 mx-auto">
                        <Button
                           outline
                           color="secondary"
                           block
                           invert={isSelected(state[type], val)}
                           onClick={() => dispatch({ type, payload: val })}
                        >
                           {val}
                        </Button>
                     </Col>
                  )
            })}
         </Row>
      </>
   )
}

ActBlock.propTypes = {
   title: PropTypes.string,
   subTitle: PropTypes.string,
   type: PropTypes.string.isRequired,
   values: PropTypes.array.isRequired,
   dispatch: PropTypes.func.isRequired,
   state: PropTypes.object.isRequired,
   invalid: PropTypes.bool,
}

export default ActBlock