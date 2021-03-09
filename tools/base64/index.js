exports.controller = (reqData) => {
  let action = 'decode';
  let text = '';
  try {
    reqData = JSON.parse(reqData);
    action = reqData.action;
    text = reqData.text;
  } catch (err) {
    console.log('Content is not json');
  }


  if (action === 'encode') {
    const buffer = Buffer.from(text);
    return buffer.toString('base64');
  } else if (action === 'decode') {
    const buffer = Buffer.from(text, 'base64');
    return buffer.toString();
  }
}