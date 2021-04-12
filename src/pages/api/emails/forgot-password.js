import Cors from "micro-cors"

import { sendMail } from "../../../services/email"
import { sendAPIError, sendMethodNotAllowedError } from "../../../services/errorHelpers"
import { METHOD_OPTIONS, METHOD_POST, STATUS_200_OK, STATUS_500_INTERNAL_SERVER_ERROR } from "../../../utils/http"

const html = `
Bonjour 👋,

<p>Vous avez oublié votre mot de passe Médlé ? Définissez-en un nouveau.</p>

<p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. <br/>
Si vous ne souhaitez pas réinitialiser votre mot de passe, vous pouvez ignorer cet e-mail.</p>

<p>Vous allez pouvoir le réinitialiser en cliquant sur ce lien mais attention, il n'est valable que 30 minutes :</p>

<p><a href="https://medle.fabrique.social.gouv.fr/">https://medle.fabrique.social.gouv.fr/</a></p>

<p>Si le lien de réinitialisation ne s’affiche pas, copiez et collez-le dans votre navigateur.<br>
Si votre lien de réinitialisation a expiré, demandez-en un nouveau.</p>

<p>A bientôt sur Médlé 🚀,</p>

<p>Des questions sur Médlé? La réponse se trouve peut-être dans la <a href="https://medle.fabrique.social.gouv.fr/faq">FAQ</a> 🤞.</p>
`

const handler = async (req, res) => {
  res.setHeader("Content-Type", "application/json")
  const to = req?.body.email
  try {
    switch (req.method) {
      case METHOD_POST: {
        try {
          const info = await sendMail({
            html,
            subject: "Médlé : oubli de mot de passe",
            to,
          })

          console.debug(info)
          return res.status(STATUS_200_OK).json({})
        } catch (error) {
          console.error("SEND_VERIFICATION_EMAIL_ERROR", to, error)
          return res.status(STATUS_500_INTERNAL_SERVER_ERROR).json({
            detail: error.detail,
            message: error.message,
            status: STATUS_500_INTERNAL_SERVER_ERROR,
          })
        }
      }
      default:
        if (req.method !== METHOD_OPTIONS) return sendMethodNotAllowedError(res)
    }
  } catch (error) {
    sendAPIError(error, res)
  }
}

const cors = Cors({
  allowMethods: [METHOD_POST, METHOD_OPTIONS],
})

export default cors(handler)
