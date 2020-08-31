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
    res.send(`API REST IBRRP ${new Date}`)
});

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3333;

app.listen(port, host, () => { console.log('Server is Running...') });