const express = require('express')

const Culto = require('../models/Culto');

const router = express.Router();

//router.post('/register', async (req, res) => 

router.get('/', async (req, res) => {
    const culto = await Culto.find()
        .where('vagas').gt(0)
        .sort({ 'datatime': -1, 'createdAt': 1 })
        .limit(4)
    return res.send(culto)
})

router.post('/create', async (req, res) => {
    const dados = req.body;
    try {
        const culto = await Culto.create(dados);

        console.log(culto)
        return res.send(culto)
    } catch (err) {
        return res.status(400).send({ err })
    }
});

module.exports = app => app.use('/cultos', router)