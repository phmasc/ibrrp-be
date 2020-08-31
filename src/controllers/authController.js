const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const router = express.Router();

function gentoken(params = {}) {
    return jwt.sign({ params }, process.env.SECRET_AUTH, {
        expiresIn: 86400,
    })
};

router.get('/', async (req, res) => {
    const { name, dtNascimento, cpf } = req.query;

    try {
        const isFilter = !(!(cpf || name || dtNascimento))
        const filter = cpf ? { cpf } : { name, dtNascimento }

        const user = await User.find(isFilter ? filter : {})

        return res.send(user)
    } catch (error) {
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
        return res.status(400).send({ err })
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

module.exports = app => app.use('/auth', router)