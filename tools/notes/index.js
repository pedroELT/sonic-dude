const { writeFileSync, readFileSync } = require('fs');
const { mdToPdf } = require('md-to-pdf');

const saveData = (data) => {
  return writeFileSync(__dirname + '/data.json', JSON.stringify(data));
};


exports.preview = async (reqData) => {
  return { topics: JSON.parse(readFileSync(__dirname + '/data.json')) };
};

exports.controller = async (reqData, headers, res) => {
  const data = JSON.parse(readFileSync(__dirname + '/data.json'));
  console.log(reqData.action, reqData.topic, reqData.note);
  switch (reqData.action) {
    case 'add-topic':
      if (!data[reqData.topic]) {
        data[reqData.topic] = {};
        saveData(data);
      }
      return { topics: data };
    case 'add-note':
      if (data[reqData.topic] && !data[reqData.topic][reqData.note]) {
        data[reqData.topic][reqData.note] = "Your awesome Note";
        saveData(data);
      }
      return { topics: data };
    case 'convert':
      if (data[reqData.topic] && data[reqData.topic][reqData.note]) {
        try {
          const pdf = await mdToPdf({ content: data[reqData.topic][reqData.note] });
          res.writeHead(200, 'Conversion ok', {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${reqData.topic}-${reqData.note}.pdf"`,
            'Content-Length': pdf.content.length
          });
          res.write(pdf.content);
          res.end();
        } catch (err) {
          console.log(err);
          throw err;
        }
      } 
      return undefined;
    case 'delete-note':
      delete data[reqData.topic][reqData.note];
      saveData(data);
      return { topics: data };
    case 'delete-topic':
      delete data[reqData.topic];
      saveData(data);
      return { topics: data };
    case 'get':
      console.log("note", data[reqData.topic][reqData.note]);
      return data[reqData.topic][reqData.note];
    case 'set':
      if (data[reqData.topic] && data[reqData.topic][reqData.note]) {
        data[reqData.topic][reqData.note] = reqData.content;
        saveData(data);
      }
      return data[reqData.topic][reqData.note];
  }
};
