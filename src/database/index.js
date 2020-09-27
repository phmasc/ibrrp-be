const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

//Local onde está o banco do mongo db
mongoose.connect(
    process.env.DB_URL
    , {
        useUnifiedTopology: true,
    });

// Sempre assim no node
mongoose.Promise = global.Promise;

module.exports = mongoose;