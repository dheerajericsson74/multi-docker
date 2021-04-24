const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'postgres',
  password: 'postgres_password',
  port: 5432,
});
pgClient.connect();
pgClient.on('error', () => console.log(' Server/index.js ################   Lost PG connection Maha UKP Ullu    ######################## !!' ));

const query = `CREATE TABLE IF NOT EXISTS values (number INT);`;

pgClient.query(query,(err,res) => {
  if (err) {
    console.error(err);
    return;
}
console.log('Server/index.js Table values is successfully created');
});
//
//pgClient
//  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
//  .catch(err => console.log(err));

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
    console.log(' Server/index.js : req =>/ Keya hai UKP !!!!');
  res.send('Keya hai UKP !!!! ');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');
  console.log(' SerServer/index.jser : req =>/values/all  from postgres db :'+values.rows);
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    console.log(' Server/index.js : req =>values/current  from redis obj :'+values);
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;
  console.log(' Server/index.js :POST  req =>values from db :'+index);
  if (parseInt(index) > 40) {
    console.log(' Server/index.js : values to high leamon choose lee maha ullu  :'+index);
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
  console.log(' Server/index.js : inserted in postgres databas   :'+index);
  res.send({ working: true });
});

app.listen(5000, err => {
  console.log('Server/index.js Listening for erroes UKP  on port 5000   !!!! ');
});
