const { readFileSync, writeFileSync } = require('fs');
const crypto = require('crypto');

exports.controller = async (reqData) => {
  let action = 'load';
  let password = reqData;
  let configuration = {};
  try {
    reqData = JSON.parse(reqData);
    action = 'save';
    password = reqData.password;
    configuration = reqData.configuration;
  } catch (err) {
    console.log('Content is not json');
  }

  console.log(action, password, configuration);
  if (action === 'save' && password && configuration) {
    const cipher = crypto.createCipher('aes-256-ctr', password)
    var crypted = cipher.update(JSON.stringify(configuration),'utf8','hex')
    crypted += cipher.final('hex');
    writeFileSync(__dirname+'/configuration.json', crypted);
    return '';
  } else if (action === 'load' && password) {
    const configCiphered = readFileSync(__dirname+'/configuration.json').toString();
    var decipher = crypto.createDecipher('aes-256-ctr',password)
    var dec = decipher.update(configCiphered,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  }
};