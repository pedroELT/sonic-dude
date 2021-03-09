const crypto = require('crypto');

exports.controller = async (reqData) => {
  let action = 'decipher';
  let password = reqData;
  let text = {};
  try {
    reqData = JSON.parse(reqData);
    if (reqData.action) action = reqData.action;
    password = reqData.password;
    text = reqData.text;
  } catch (err) {
    console.log('Content is not json');
  }

  console.log(action, password, text);
  if (action === 'cipher' && password && text) {
    const cipher = crypto.createCipher('aes-256-ctr', password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
  } else if (action === 'decipher' && password && text) {
    var decipher = crypto.createDecipher('aes-256-ctr',password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  }
};