const mongoose = require('../database');
const bcrypt = require('bcryptjs')

const questionSchema = new mongoose.Schema({
    '1': String,
    '2': String,
    '3': String,
    '4': String,
    '5': String,
    '6': String,
    '7': String,
    '8': String,
    '9': String,
    '10': String,
    '11': String,
    '12': String,
    '13': String,
    '14': String,
})

const question = mongoose.model('question', questionSchema);

// Schema === Tabela SQL
const MemberSchema = new mongoose.Schema({
    name: { type: String, required: true, },
    cpf: { type: Number, unique: true, required: true, },
    dtNascimento: { type: Date, required: true, },
    email: { type: String, required: true, lowercase: true, },
    telefone: { type: String, required: true, },
    password: { type: String, select: false },
    token: { type: String, select: false },
    questions: { ref: 'question', type: mongoose.Schema.Types.ObjectId, },
    culto_id: { ref: 'Culto', type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now, },
});

MemberSchema.pre('save', async function (next) {
    //this objeto que está sendo salvo
    if (this.password) {
        const hash = await bcrypt.hash(this.password, 10)
        this.password = hash
    }

    next();
});

const Member = mongoose.model('Member', MemberSchema);

module.exports = Member;