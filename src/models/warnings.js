const mongoose = require('../database');

// Schema === Tabela SQL
const WarningsSchema = new mongoose.Schema({
    type: { type: String, required: true, unique: true },
    title: { type: String, required: true, },
    description: { type: String, required: true, },
    createdAt: { type: Date, default: Date.now, },
})

const Warnings = mongoose.model('Warnings', WarningsSchema);

module.exports = Warnings;