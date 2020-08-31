const express = require('express');
const bodyParser = require('body-parser');

const app = express();

require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

require('./controllers/authController')(app)
require('./controllers/cultoController')(app)
require('./controllers/warningsController')(app)


app.get('/', (req, res) => {
    res.send(`HelloWorld ${process.env.SECRET_AUTH}`)
});

app.listen(process.env.PORT || 3333, () => { console.log('Running...') });