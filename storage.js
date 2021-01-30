const { existsSync } = require('fs');
const fs = require('fs/promises');
const IPCIDR = require('ip-cidr');

let storage = {};
const RANGES = ["62.165.192.0/18", "77.234.64.0/19", "78.131.0.0/17", "80.95.64.0/20", "80.95.80.0/20", "81.17.176.0/20", "82.131.128.0/19",
  "82.131.224.0/19", "92.249.128.0/17", "94.21.0.0/16", "176.241.0.0/18", "178.164.128.0/17", "188.143.0.0/17"];
const ips = [];

module.exports = {
  async init() {
    if (!existsSync('store.json')) {
      await fs.writeFile('store.json', '{}');
    }
    storage = JSON.parse(await fs.readFile('store.json'));

    console.log('init: loading IPs to memory');
    const assigned = [].concat(...Object.values(storage));
    for (let i = 0; i < RANGES.length; i++) {
      const range = new IPCIDR(RANGES[i]);
      ips.push(...range.toArray().filter(x => assigned.indexOf(x) === -1));
    }    
    console.log('init: CIDR ranges processed,', ips.length, 'ips targeted in total,', assigned.length, 'already in circulation');
  },

  async _commit() {
    return fs.writeFile('store.json', JSON.stringify(storage));
  },

  async setValue(key, val) {
    storage[key] = val;
    return this._commit();
  },

  getValue(key) {
    return storage[key];
  },

  getIter() {
    return Object.entries(storage);
  },

  getNextIp() {
    return ips.shift();
  },
};
