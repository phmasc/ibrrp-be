const mongoose = require('../database');

// Schema === Tabela SQL
const CultoSchema = new mongoose.Schema({
    name: { type: String, required: true, },
    schedule: { type: Date, required: true, },
    vagas: { type: Number, required: true, },
    idadeMin: { type: Number, required: false, },
    idadeMax: { type: Number, required: false, },
    isolated: { type: Boolean, default: true },
    pass:{type: String, required: false},
    description: { type: String, required: true, },
    createdAt: { type: Date, default: Date.now, },
    member_id: [{ ref: 'Member', type: mongoose.Schema.Types.ObjectId }]
})

const Culto = mongoose.model('Culto', CultoSchegitma);

module.exports = Culto;