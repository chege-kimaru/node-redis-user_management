const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser')
const methodOverride = require('method-override');
const redis = require('redis');

const client = redis.createClient();
client.on('connect', () => {
    console.log('Connected to redis');
});

const port = 3000;

const app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(methodOverride('_method'));

app.get('/', (req, res, next) => {
    res.render('searchusers');
});

app.post('/user/search', (req, res, next) => {
    let id = req.body.id;

    client.hgetall(id, (err, obj) => {
        if(!obj) {
            res.render('searchusers', {error:'User does not exist'});
        } else {
            obj.id = id;
            res.render('details', {user: obj});
        }
    })
});

app.get('/user/add', (req, res, next) => {
    res.render('adduser');
});

app.post('/user/add', (req, res, next) => {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], (err, reply) => {
        if(err) res.render('adduser', {error: err});
        console.log(reply);
        res.redirect('/');
    });
});

app.delete('/user/delete/:id', (req, res, next) => {
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log('Server on');
})