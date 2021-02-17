const nodemailer = require('nodemailer')

function _generateEmail (name, clientEmail, subject, message) {
  return `
  <p>Une demande de contact a été envoyée, le sujet est: <strong>${subject}</strong></p>
  <div><strong>nom:</strong> ${name}</div>
  <div><strong>email:</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></div>
  <strong>message:</strong>
  <div>${message}</div>

  <hr align="left" style="background-color: #57585a; border: none; height: 1px; width: 100px; margin-top: 30px"/>
  <div>Cet email a été généré automatiquement, <strong style="color:#EF5350">NE JAMAIS REPONDRE DIRECTEMENT A CET EMAIL.</strong></div>
  `
}

function sendContactMail (contactFormData) {
  if (!contactFormData.name || !contactFormData.email || !contactFormData.subject || !contactFormData.message) {
    throw new Error(`one of require field for the contact email is missing, got: ${JSON.stringify(contactFormData, null, 4)}`)
  }

  const { name, email, subject, message } = contactFormData

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    }
  })

  return transporter.sendMail({
    from: process.env.SMTP_MAIL_SENDER,
    to: process.env.SMTP_DEST_MAIL,
    subject: `Demande de contact - ${subject}`,
    html: _generateEmail(name, email, subject, message)
  })
}

function managePreFlight (_, res) {
  res.set('Access-Control-Allow-Methods', 'GET')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  res.set('Access-Control-Max-Age', '3600')
  return res.status(204).send('')
}

function submitContactForm (req, res) {
  const { body } = req

  res.set('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    return managePreFlight(req, res)
  }

  console.info('##### CONTACT REQUEST #####')

  console.info('origin: ', req.get('origin'))

  const authorizedOrigins = process.env.AUTHORIZED_ORIGINS.split(',')

  if (!authorizedOrigins.includes(req.get('origin'))) {
    console.error('bad origin: ', req.get('origin'))
    return res.status(403).json({
      errorType: 'bad origin',
      errorMessage: 'you\'re not authorized to use this service.'
    })
  }

  if (!body.email || !body.subject || !body.message) {
    console.error('missing input, need email, subject and message, got: ', JSON.stringify(Object.keys(body), null, 4))
    return res.status(400).json({
      errorType: 'missing required field',
      errorMessage: 'missing field, you have to provide and email, a subject and a message.'
    })
  }

  return service.sendContactMail(body)
    .then(
      mailSendedInfos => {
        console.info('mail sended: ', JSON.stringify(mailSendedInfos, null, 4))
        res.status(200).json({ successMessage: 'message successfully send, I will respond as soon as possible.' })
      }
    ).catch(
      (err) => {
        console.error('error when send the email: ', JSON.stringify(err, null, 4))
        return res.status(500).json({
          errorType: 'sending mail fail',
          errorMessage: 'an error occured, cannot send your message. please retry later.'
        })
      }
    )
}

const service = {
  sendContactMail,
  submitContactForm
}

module.exports = service
