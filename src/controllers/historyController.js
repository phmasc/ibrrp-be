const express = require('express')

const History = require('../models/history')
const Culto = require('../models/culto')

const router = express.Router();

router.get('/', async (req, res) => {
    const { cultoId } = req.query;

    if (cultoId) {
        const hist = await History
            .find({ culto_id: cultoId })
            //.select('check temp')
            .populate('member_id', 'name dtNascimento')
            .populate('culto_id', 'isolated name schedule vagas description')

        return res.send({ hist })
    }

    return res.status(400).send({ err: 'cultoId não existente' })
})

module.exports = app => app.use('/history', router)