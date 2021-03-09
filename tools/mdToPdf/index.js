const { mdToPdf } = require('md-to-pdf');
const { extname } = require('path');

exports.controller = async (reqData, headers, res) => {
  const boundary = headers['content-type'].split('=')[1];
  
  const data = {};
  const formData = reqData.split(boundary);
  formData.forEach(form => {
    const dataLines = form.split('\n');
    let formKey = '';
    dataLines.forEach( line => {
      if (line.startsWith('Content-Disposition')) {
        let parameters = line.split(';');
        parameters.forEach(param => {
          let [key, value] = param.split('=');
          if (key && value) {
            key = key.trim();
            value = value.trim().replace(/"/g,'');
            if (key === 'name') {
              data[value] = "";
              formKey = value;
            } else if (key === 'filename') {
              data.filename = value;
            }
          }
        });
      } else if (line.startsWith('Content-Type')) {
        // 
      } else if (!(line.trim() === '--')){
        if (data[formKey] || line.trim()) {
          data[formKey] += line + "\n";
        }
      }
    });
  });

  let markdown = '';
  let filename = 'markdown.pdf';
  if (data.filename) {
    const extension = extname(data.filename);
    filename = data.filename.replace(extension, '.pdf');
    markdown = data.markdown;
  } else {
    markdown = data.markdownText;
  }

  const pdf = await mdToPdf({ content: markdown });
  res.writeHead(200, 'Conversion ok', {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${filename}"`,
    'Content-Length': pdf.content.length
  });
  return pdf.content;
}