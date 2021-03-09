#!/usr/bin/env node
const express = require('express');
const nativeImage = require('electron').nativeImage;
const bodyParser = require('body-parser');
const { readFileSync } = require('fs');
const { app, BrowserWindow } = require('electron');

const { toolsService } = require('./tools');


const port = process.env.PORT || 25250;
const serverOnly = process.env.SERVER_ONLY || false;

const http = express();

http.use(bodyParser.json());
http.use(bodyParser.urlencoded({ extended: true }));

http.set('view engine', 'pug');
http.set('views', ['./src', toolsService.getToolsFolder()]);

http.get('/', (req, res) => {
  toolsService.load();
  res.render(`index`, { tools: toolsService.tools, configured: toolsService.configuredTools });
});

http.get('/logo.png', (req, res) => {
  res.send(readFileSync('./src/logo.png'));
});

http.get('/tools', (req, res) => {
  res.render(`create-tool`, { tools: toolsService.tools, configured: toolsService.configuredTools });
});

http.post('/tools', (req, res) => {
  toolsService.load();
  if (!req.body.description || !req.body.name) {
    res.status(400);
    res.send('Missing name and/or description is missing');
  } else if (toolsService.exists(req.body.tool)) {
    res.status(400);
    res.send(`Tool '${req.body.tool}' already exists`);
  } else {
    try {
      const tool = {
        description: req.body.description,
        disabled: true
      };
      const tools = {...toolsService.configuredTools};
      tools[req.body.name] = tool;
      toolsService.save(tools);
      toolsService.installToolIndexes(req.body.name);
      tools[req.body.name].disabled = false;
      toolsService.save(tools);
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500);
      res.send(JSON.stringify(err));
    }
  }
  
});


http.get('/:tool', async (req, res) => {
  toolsService.load();
  if (!toolsService.exists(req.params.tool)) {
    res.writeHead(404, 'Tool not defined');
  } else {
    let controllerResult = {};
    if (toolsService.hasController(req.params.tool)) {
      const toolController = toolsService.getController(req.params.tool);
      controllerResult = toolController.preview ? await toolController.preview.call(this, req.body || req.query, req.headers, res) : {};
    }
    res.render(`${req.params.tool}/index`, controllerResult);
  }
});

http.post('/:tool', async (req, res) => {
  toolsService.load();
  if (!toolsService.hasController(req.params.tool)) {
    res.sendStatus(404, 'Tool is not defined or has no controller defined');
  } else {
    try {
      const toolController = toolsService.getController(req.params.tool);
      const controllerResult = await toolController.controller.call(this, req.body || req.query, req.headers, res);
      if (controllerResult !== undefined) {
        if (req.accepts('html')) {
          res.render(`${req.params.tool}/index`, controllerResult);
        } else {
          res.send(controllerResult);
        }
      }
    } catch (err) {
      console.error(err);
      res.sendStatus(500, JSON.stringify(err));
    }
  }
});

http.post('/:tool/checked', async (req,res) => {
  toolsService.load();
  if (!toolsService.exists(req.params.tool)) {
    res.writeHead(404, 'Tool not defined');
  } else {
    try {
      toolsService.configuredTools[req.params.tool].checked = req.body.checked;
      toolsService.save();
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(500);
    }
  }
});

http.post('/:tool/description', async (req,res) => {
  toolsService.load();
  if (!toolsService.exists(req.params.tool)) {
    res.writeHead(404, 'Tool not defined');
  } else {
    try {
      toolsService.configuredTools[req.params.tool].description = req.body.description;
      toolsService.save();
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(500);
    }
  }
});

http.post('/:tool/disabled', async (req,res) => {
  toolsService.load();
  if (!toolsService.exists(req.params.tool)) {
    res.writeHead(404, 'Tool not defined');
  } else {
    try {
      toolsService.configuredTools[req.params.tool].disabled = req.body.disabled;
      toolsService.save();
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(500);
    }
  }
});


const createWindow = () => {
  const image = nativeImage.createFromPath('src/logo.png');
  image.setTemplateImage(true);

  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true
    },
    icon: image
  });

  win.maximize();
  win.show();
  win.loadURL(`http://localhost:${port}/`);
};

http.listen(port, () => {
  console.log(`Start serving tool dude on port ${port}`);
  if (!serverOnly) {
    app.whenReady().then(createWindow);

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  }
});