const express = require('express')

const gerarCode = require('../utils/gerarCode')

const Warnings = require('../models/warnings')

const router = express.Router();

router.get('/', async (req, res) => {
    const { type } = req.query;

    const warn = await Warnings.find(type ? { type } : {})

    return res.send(warn)


})

router.post('/create', async (req, res) => {
    const { type } = req.body;
    try {
        if (await Warnings.findOne({ type })) {
            return res.status(400).send({ error: 'Warnings type is already' })
        }

        const warn = await Warnings.create(req.body)


        return res.send(warn)

    } catch (error) {
        return res.status(401).send(error)
    }
})

router.post('/code', async (req, res) => {
    const { id, cultoId } = req.body;

    console.log({ 'function': gerarCode(id, cultoId) })


    const code = await gerarCode(id, cultoId)



    res.send({ code })
})

module.exports = app => app.use('/warnings', router)