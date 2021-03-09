const spawn = require('child_process').spawn;

const execWithData = async (program, args, options) => {
  return new Promise((resolve,reject) => {
    const spawnedProgram = spawn(program, args, );
    
    let finalData = [];
    let error = [];
    spawnedProgram.stdout.on('data', (data) => {
      finalData.push(data)
    });
    spawnedProgram.stderr.on('data', (data) => {
      error.push(data)
    });


    spawnedProgram.on('close', () => {
      if (error.length) {
        reject(Buffer.concat(error).toString());
      } else {
        resolve(Buffer.concat(finalData).toString());
      }
    });
  
  });
};

exports.preview = async () => {
  return  { containers: await execWithData('docker', ['ps', '-a', '--format', 'table {{.Names}}\t{{.ID}}\t{{.Status}}\t{{.Ports}}']) };
};

exports.controller = async (reqData) => {
  let action = 'all';
  let container = '';
  try {
    reqData = JSON.parse(reqData);
    if (reqData.action) action = reqData.action;
    container = reqData.container;
  } catch (err) {
    console.log('Content is not json');
  }

  let result = '';
  console.log(action);
  switch(action) {
    case 'all' :
      result = await execWithData('docker', ['ps', '-a', '--format', 'table {{.Names}}\t{{.ID}}\t{{.Status}}\t{{.Ports}}']);
      break;
    case 'stop-all':
      const dataContainers = await execWithData('docker', ['ps', '-aq']);
      const containers = dataContainers.split('\n');
      let stopResults = [];
      for (let container of containers) {
        try {
          const stopResult = await execWithData('docker', ['stop', `${container}`]);
          stopResults.push(stopResult);
          console.log('stopResult', stopResult);
        } catch (err) {
          console.error(err);
        }
      }
      result = stopResults.join('\n');
      break;
    case 'start':
      result = await execWithData('docker', ['start', `${container}`]);
      break;
    case 'stop' : 
      result =  await execWithData('docker', ['stop', `${container}`]);
      break;
    case 'delete' :
      result =  await execWithData('docker', ['rm', '-f' ,`${container}`]);
      break;
  }

  console.log('result', result);
  return result;
};