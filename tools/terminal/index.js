const spawn = require('child_process').spawn;

let spawnedCommand;

exports.preview = async (reqData) => {

};

exports.controller = async (reqData, headers, res) => {
  try {
    console.log('Executing', reqData.command);
    spawnedCommand = spawn(reqData.command.split(' ')[0], [...reqData.command.split(' ').slice(1)]);

    
    spawnedCommand.stdout.on('data', (data) => {
      res.write(data);
    });
    spawnedCommand.stderr.on('data', (data) => {
      res.write(data);
    });    

   spawnedCommand.once('exit', (code, signal) => {
      if (code === 0) {
        res.status(200).send();
      } else {
        console.error(code);
        res.status(500).send(code);
      }
    });
    spawnedCommand.once('error', (err) => {
      console.error(err);
      res.status(500).send(err);
    });

    
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }

};
