const dotenv = require("dotenv")
const createTransport = require("nodemailer").createTransport

// import { createTransport } from "nodemailer"
dotenv.config()

const transportConfig = {
  auth: {
    pass: process.env.MAIL_PASSWORD,
    user: process.env.MAIL_USERNAME,
  },
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
}

const sendMail = ({ subject, text, html, attachments, to }) => {
  const mailOptions = {
    attachments,
    from: process.env.MAIL_FROM,
    html,
    subject,
    text,
    to,
  }

  const transport = createTransport(transportConfig)

  transport.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error)
    } else {
      console.debug(info)
    }
  })

  transport.close()
}

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

sendMail({
  html,
  subject: "Médlé : oubli de mot de passe",
  to: "mauguet.po@gmail.com",
})

/*
Pinterest


Désolé
Le lien de réinitialisation du mot de passe n'est pas valide ou a expiré (durée de validité : 24 heures), peut-être parce qu'il a déjà été utilisé.
Veuillez demander une nouvelle réinitialisation du mot de passe


*/
