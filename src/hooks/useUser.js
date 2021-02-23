import React from "react"

export const UserContext = React.createContext()
UserContext.displayName = "UserContext"

export function useUser() {
    const userContext = React.useContext(UserContext)

    if (!userContext) throw new Error("Le hook useUser doit être employé à l'intérieur d'un <UserContext>")

    return userContext
}
