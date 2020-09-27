const mongoose = require('../database');

// Schema === Tabela SQL
const HistorySchema = new mongoose.Schema({

    key: { type: String, required: true, unique: true },

    member_id: { ref: 'Member', type: mongoose.Schema.Types.ObjectId },
    culto_id: { ref: 'Culto', type: mongoose.Schema.Types.ObjectId },

    r1: String,
    r2: String,
    r3: String,
    r4: String,
    r5: String,
    r6: String,
    r7: String,
    r8: String,
    r9: String,
    r10: String,
    r11: String,
    r12: String,
    r13: String,
    r14: String,

    check: Boolean,
    temp: Boolean,

    createdAt: { type: Date, default: Date.now, }
})

const History = mongoose.model('History', HistorySchema);

module.exports = History;