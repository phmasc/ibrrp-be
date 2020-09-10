const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/member');
const Culto = require('../models/culto');
const Warnings = require('../models/warnings');

const sendMail = require('../utils/sendMail');

const router = express.Router();

// Funçao para gerar um tokem aleatorio de autenticação para o usuario
function gentoken(params = {}) {
    return jwt.sign({ params }, process.env.SECRET_AUTH, {
        expiresIn: 900,
    })
};

router.get('/', async (req, res) => {
    const { name, dtNascimento, cpf } = req.query;

    try {
        const isFilter = !(!(cpf || name || dtNascimento))
        const filter = cpf ? { cpf } : { name, dtNascimento }

        const user = await User
            .findOne(isFilter ? filter : {})
            .populate('culto_id', 'name schedule')

        var warn = Warnings

        if (user.culto_id) {
            if (user.culto_id.schedule.getTime() < Date.now()) {
                warn = await Warnings.find({ type: "authorized" })
            } else {
                warn = await Warnings.find({ type: "duplicate" })
            }
        } else {
            warn = await Warnings.find({ type: "authorized" })
        }
        return res.send({
            user,
            token: gentoken({ id: user.id }),
            warn
        })
    } catch (error) {
        console.log(error)
        return res.status(400).send(error)
    }
})


router.post('/register', async (req, res) => {
    const { cpf } = req.body;

    try {
        if (await User.findOne({ cpf }))
            return res.status(400).send({ error: 'User already exists' })

        const user = await User.create(req.body);

        //para retirar a senha do retorno
        user.password = undefined;

        return res.send({
            user,
            token: gentoken({ id: user.id })
        })
    } catch (err) {
        return res.status(400).send(err)
    }
})

router.post('/authenticate', async (req, res) => {
    const { cpf, password } = req.body;

    const user = await User.findOne({ cpf }).select('+password');

    if (!user)
        return res.status(400).send({ error: "User not found" });

    if (user.password !== '') {
        if (password !== process.env.MASTER_PASSWORD) {
            if (!await bcrypt.compare(password, user.password))
                return res.status(400).send({ error: 'Invalid password' })
        }
    }

    user.password = undefined;

    const token = gentoken({ id: user.id })

    res.send({
        user,
        token
    })
});

router.post('/booking', async (req, res) => {
    const { id, cultoId } = req.body;
    var type;

    try {
        const user = await User.findOne({ "_id": id })
        if (!user)
            return res.status(400).send({ error: 'User not exists' })

        const culto = await Culto.findOne({ "_id": cultoId })

        if (!culto)
            return res.status(400).send({ error: "Culto not exists" })

        if (culto.vagas < 1) {

            type = 'apologize'

        } else {
            await Culto.updateOne({ "_id": cultoId }, { vagas: culto.vagas - 1 })

            Culto.findByIdAndUpdate(cultoId, { $push: { member_id: id } })

            await Culto.updateOne({ "_id": cultoId }, { $push: { 'member_id': id } })
            await User.updateOne({ '_id': id }, { 'culto_id': cultoId })
            type = 'approved'

            const email = await Warnings.findOne({ 'type': 'emailHtml' })

            await sendMail(user.email, email.title, email.description)
        }

        const warn = await Warnings.findOne({ 'type': type })

        return res.send(warn)

    } catch (error) {

    }

})

module.exports = app => app.use('/auth', router)