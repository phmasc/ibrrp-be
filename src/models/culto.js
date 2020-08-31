const mongoose = require('../database');

// Schema === Tabela SQL
const CultoSchema = new mongoose.Schema({
    name: { type: String, required: true, },
    schedule: { type: Date, required: true, },
    vagas: { type: Number, required: true, },
    description: { type: String, required: true, },
    createdAt: { type: Date, default: Date.now, },
})

const Culto = mongoose.model('Culto', CultoSchema);

module.exports = Culto;