const generator = require('generate-password');
exports.controller = (reqData, res) => {
  let length = 16;
  try {
    reqData = JSON.parse(reqData);
    if (reqData.length) {
      length = reqData.length
    }
  } catch (err) {
    console.log('Content is not json');
  }


  return generator.generate({
    length: length ? length : 16,
    numbers: true,
    symbols: true,
    excludeSimilarCharacters : true,
    exclude: "{ } [ ] ( ) / \\ ' \" ` ~ , ; : . < > $"
  });
}