const html2pug = require('html2pug');

exports.controller = (reqData) => {
  return html2pug(reqData.html, { tabs: true });
}