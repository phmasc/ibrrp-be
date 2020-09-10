const express = require('express')

const Culto = require('../models/culto');

const router = express.Router();

//router.post('/register', async (req, res) => 

router.get('/', async (req, res) => {
    const { id } = req.query;

    const culto = await Culto.find(id ? { _id: id } : {})
        .where('vagas').gt(0)
        .where('schedule').gt(Date.now())
        .sort({ 'schedule': 1, 'createdAt': 1 })
        .limit(4)

    return res.send(culto)
})

router.get('/list', async (req, res) => {
    const { id } = req.query;

    const culto = await Culto.find(id ? { _id: id } : {})
        .where('vagas').gt(0)
        .where('schedule').gt(Date.now())
        .sort({ 'schedule': 1, 'createdAt': 1 })
        .populate('member_id', 'name email')
        .limit(4)

    return res.send(culto)
})

router.post('/create', async (req, res) => {
    const dados = req.body;
    try {
        const culto = await Culto.create(dados);

        return res.send(culto)
    } catch (err) {
        return res.status(400).send({ err })
    }
});

module.exports = app => app.use('/cultos', router)