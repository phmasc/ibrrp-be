const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/member');
const Culto = require('../models/culto');
const Warnings = require('../models/warnings');
const History = require('../models/history')

const sendMail = require('../utils/sendMail');
const gerarCode = require('../utils/gerarCode');

const router = express.Router();

// Funçao para gerar um tokem aleatorio de autenticação para o usuario
function gentoken(params = {}) {
    return jwt.sign({ params }, process.env.SECRET_AUTH, {
        expiresIn: 900,
    })
};

router.get('/', async (req, res) => {
    const { cultoId, name, dtNascimento, cpf } = req.query;
    console.log('phsystem - request:', { cultoId, cpf })

    try {
        const isFilter = !(!(cpf || name || dtNascimento))
        const filter = cpf ? { cpf } : { name, dtNascimento }

        const user = await User
            .findOne(isFilter ? filter : {})
            .populate('culto_id', 'name schedule isolated')

        const culto = await Culto.findOne({ "_id": cultoId })

        var warn = Warnings

        if (user.culto_id) {
            if (culto.member_id.indexOf(user._id) > -1) {
                warn = await Warnings.find({ type: "duplicate" })
                console.log('phsystem - request:', user._id, cultoId, 'solicitacao para acessar o culto negada por já está neste culto')

            } else if ((user.culto_id.schedule.getTime() < Date.now())
                || (!culto.isolated && culto._id !== user.culto_id)) {
                warn = await Warnings.find({ type: "authorized" })
                console.log('phsystem - request:', user._id, cultoId, 'solicitacao para acessar o culto concedida')

            } else {
                warn = await Warnings.find({ type: "duplicate" })
                console.log('phsystem - request:', user._id, cultoId, 'solicitacao para acessar o culto negada por duplicacao')
            }
        } else {
            warn = await Warnings.find({ type: "authorized" })
            console.log('phsystem - request:', user._id, cultoId, 'solicitacao para acessar o culto concedida')
        }
        return res.send({
            user,
            token: gentoken({ id: user.id }),
            warn
        })
    } catch (error) {
        console.log('request:', user._id, cultoId, `solicitacao de ${name} com CPF ${cpf} para acessar o culto obteu error ${error}`)
        return res.status(400).send(error)
    }
})

router.post('/register', async (req, res) => {
    const { cpf } = req.body;

    console.log(`phsystem - register: solicitação para inserção do CPF: ${cpf} na base`)

    try {
        if (await User.findOne({ cpf })) {
            console.log('phsystem - register: error User already exists ')
            return res.status(400).send({ error: 'User already exists' })
        }

        const user = await User.create(req.body);

        //para retirar a senha do retorno
        user.password = undefined;
        console.log(`phsystem - register: CPF ${cpf} registrado com sucesso`)
        return res.send({
            user,
            token: gentoken({ id: user.id })
        })
    } catch (err) {
        console.log(`phsystem - register: CPF ${cpf} houve error ${err}`)
        return res.status(400).send(err)
    }
})

router.post('/authenticate', async (req, res) => {
    const { cpf, password } = req.body;

    const user = await User.findOne({ cpf }).select('+password');

    console.log(user)


    if (!user)
        return res.status(400).send({ error: "User not found" });

    try {
        if (user.password !== '') {
            if (password !== process.env.MASTER_PASSWORD) {
                if (!await bcrypt.compare(password, user.password)) {
                    if (password !== user.password)
                        return res.status(400).send({ error: 'Invalid password' })
                }
            }
        }

        user.password = undefined;

        const token = gentoken({ id: user.id })

        res.send({
            user,
            token
        })
    } catch (error) {
        return res.status(400).send({ "Err": 'Usuario sem senha' })
    }
});

router.post('passwordchange', async (req, res) => {
    const { user, password, newpassword } = req.body;

    try {

    } catch (error) {

    }

})

router.post('/booking', async (req, res) => {
    const { id, cultoId, answers } = req.body;
    var type;

    console.log(`phsystem - booking: ID ${id} tentando se cadastro no cultoId ${cultoId}`)

    try {
        const user = await User.findOne({ "_id": id })
        if (!user) {
            console.log(`phsystem - booking: error = User não exists`)
            return res.status(400).send({ error: 'User not exists' })
        }

        const culto = await Culto.findOne({ "_id": cultoId })

        if (!culto) {
            console.log(`phsystem - booking: error = Culto não exists`)
            return res.status(400).send({ error: "Culto not exists" })
        }
        if (culto.vagas < 1) {
            console.log(`phsystem - booking: error = cultoId ${cultoId} lotou em tempo de inscrição`)
            type = 'apologize'

        } else {
            await Culto.updateOne({ "_id": cultoId }, { vagas: culto.vagas - 1 })

            Culto.findByIdAndUpdate(cultoId, { $push: { member_id: id } })

            await Culto.updateOne({ "_id": cultoId }, { $push: { 'member_id': id } })

            if (culto.isolated) {
                await User.updateOne({ '_id': id }, { 'culto_id': cultoId })
            }

            if (answers) {
                User.findByIdAndUpdate(id, { $push: { questions: answers } })
            }



            type = 'approved'

            const email = await Warnings.findOne({ 'type': 'emailConfirmacao' })

            console.log(`phsystem - booking: ID ${id} inserido no cultoId ${cultoId}`)

            await History.create({
                key: (id + '-' + cultoId + '-ADD'),
                type: 'ADD',
                member_id: id,
                culto_id: cultoId
            }).catch(err => console.log(err))

            await sendMail(user.email, `${email.title} para o ${culto.name} na data ${culto.schedule.toLocaleDateString()}`, email.description)
        }

        const warn = await Warnings.findOne({ 'type': type })

        return res.send(warn)

    } catch (error) {
        console.log(`phsystem - booking: ID ${id} cultoId ${cultoId} error = ${error}`)
        console.log({ error })
    }

})

router.post('/checking', async (req, res) => {
    const { userId, cultoId, check, temp } = req.body;

    try {
        const user = await User.findOne({ "_id": userId })
        if (!user) {
            console.log(`phsystem - booking: error = User não exists`)
            return res.status(400).send({ error: 'User not exists' })
        }

        const culto = await Culto.findOne({ "_id": cultoId })

        if (!culto) {
            console.log(`phsystem - booking: error = Culto não exists`)
            return res.status(400).send({ error: "Culto not exists" })
        }

        const hist = await History.findOne({ key: (userId + '-' + cultoId) })

        if (hist) {
            if (check && temp) {
                await History.updateOne({ '_id': hist._id }, { 'check': (check === 'true'), 'temp': (temp === 'true') })
            } else if (check) {
                await History.updateOne({ '_id': hist._id }, { 'check': (check === 'true') })
            } else {
                await History.updateOne({ '_id': hist._id }, { 'temp': (temp === 'true') })
            }

            await History.updateOne({ '_id': hist._id }, { 'check': (check === 'true'), 'temp': (temp === 'true') })
            const upHist = await History.findOne({ key: (userId + '-' + cultoId) })
            return res.send({ upHist })
        } else {
            const newHist = await History.create({
                key: (userId + '-' + cultoId),
                member_id: userId,
                culto_id: cultoId,
                'check': (check === 'true'),
                'temp': (temp === 'true')
            })
            return res.send({ newHist })
        }
    } catch (error) {
        console.log(`phsystem - checking: userId ${userId} cultoId ${cultoId} check ${check} temp ${temp} error = ${error}`)
        return res.status(404).send({ error })
    }
})

router.get('/geracode', async (req, res) => {
    const { userId, cultoId } = req.query;

    return res.send(await gerarCode(userId, cultoId))
})

router.put('/unbooking', async (req, res) => {
    const { id, cultoId } = req.body;

    console.log(`phsystem - unbooking: ID ${id} tentando cancelar o cadastro no cultoId ${cultoId}`)

    try {
        const user = await User.findOne({ "_id": id })
        if (!user) {
            console.log(`phsystem - booking: error = User not exists`)
            return res.status(400).send({ error: 'User not exists' })
        }


        const culto = await Culto.findOne({ "_id": cultoId })

        if (!culto) {
            console.log(`phsystem - booking: error = Culto not exists`)
            return res.status(400).send({ error: "Culto not exists" })
        }

        await Culto.findByIdAndUpdate(cultoId, { $pull: { member_id: id } })

        await Culto.updateOne({ "_id": cultoId }, { vagas: culto.vagas + 1 })

        await User.findByIdAndUpdate({ "_id": id }, { "culto_id": undefined })

        console.log(`phsystem - unbooking: ID ${id} retirado do cultoId ${cultoId}`)

        History.create({
            key: (id + '-' + cultoId + '-DEL'),
            type: 'DEL',
            member_id: id,
            culto_id: cultoId
        }).catch(err => console.log(err))


        return res.send({ user, culto })

    } catch (error) {
        console.log({ error })
    }
})

router.get('/login', async (req, res) => {
    const { cpf, password } = req.body;

    return res.send(`Hello World Login ${cpf}`)
})

module.exports = app => app.use('/auth', router)