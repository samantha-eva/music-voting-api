const nodemailer = require('nodemailer')

// Transporteur SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // ton email Gmail
    pass: process.env.EMAIL_PASS, // mot de passe ou App Password
  },
})

// Fonction pour envoyer un email
async function sendMail({ to, subject, text, html }) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    })
    console.log(`Email envoyé à ${to}`)
  } catch (err) {
    console.error('Erreur envoi email:', err)
  }
}

module.exports = { sendMail }
