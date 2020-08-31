const express = require('express')

const Culto = require('../models/Culto')

const router = express.Router();

//router.post('/register', async (req, res) => 

router.get('/', async (req, res) => {
    return res.send({ retorno: "Ok" })
})

router.post('/create', async (req, res) => {
    const dados = req.body;
    try {

        console.log(dados)
        const culto = await Culto.create(dados);

        return res.send({
            culto,
            token: gentoken({ id: culto.id })
        })
    } catch (err) {
        return res.status(400).send({ err })
    }
});

module.exports = app => app.use('/cultos', router)