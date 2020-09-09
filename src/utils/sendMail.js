const nodemailer = require('nodemailer')

const sendMail = async (to, subject, html) => {

    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user, pass }
    })

    transporter.sendMail({
        from: user,
        sender: 'inscrição@ibrrp.com.br',
        to,
        replayTo: 'inscrição@ibrrp.com.br',
        subject,
        html,
    })
    .then(info =>  { return info })
    .catch(err => {return err})
}

module.exports = sendMail;