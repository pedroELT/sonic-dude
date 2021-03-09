
const { existsSync, readFileSync, writeFileSync, mkdirSync,  } = require('fs');

class ToolsService {
  constructor() {
    this.tools = [];
    this.configuredTools = [];

    this.load();
    Object.keys(this.tools).forEach(tool => console.log(`Tool '${tool}' initialised`));
  }

  load() {
    try {
      this.configuredTools = JSON.parse(readFileSync(`${this.getToolsFolder()}/tools.json`).toString());
      this.tools = {...this.configuredTools};
      this.prepareTools();
    } catch (err) {
      this.tools = [];
      console.error('Error while loading tools', err);
    }
  }

  save(newConfiguredTools) {
    const save = {...this.configuredTools};
    if (newConfiguredTools) this.configuredTools = newConfiguredTools;
    try {
      if (this.validate()) {
        writeFileSync(`${this.getToolsFolder()}/tools.json`, JSON.stringify(this.configuredTools, null, 4));
      } else {
        this.configuredTools = save;
        throw new Error('Confgiuration for tools is invalid');
      }
    } catch (err) {
      console.error('Error while saving tools', err);
      this.configuredTools = {...save};
      throw err;
    }
    return this.configuredTools;
  }

  installToolIndexes = (name) => {
    mkdirSync(`${this.getToolsFolder()}/${name}`);
    writeFileSync(`${this.getToolsFolder()}/${name}/index.pug`, readFileSync('./src/tool-template.pug'));
    writeFileSync(`${this.getToolsFolder()}/${name}/index.js`, `exports.preview = async (reqData) => {\n\n};\n\nexports.controller = async (reqData) => {\n\n};\n`);
  }

  getToolsFolder() {
    return process.env.TOOL_DUDE_TOOLS_PATH || './tools';
  }

  validate() {
    return Object.keys(this.configuredTools).reduce((reducer, toolKey) => {
      
      if (!this.configuredTools[toolKey].description) {
        console.error(`Description missing for ${toolKey}`);
        return false;
      }
  
      if (!this.configuredTools[toolKey].disabled && !existsSync(`${this.getToolsFolder()}/${toolKey}/index.pug`)) {
        console.error(`Template file doesn't exists for ${toolKey}`);
        return false;
      }
  
      return reducer && true;     
    }, true);
  }

  prepareTools() {
    if (!this.validate()) {
      console.error('Invalid tools configuration');
      process.exit(1);
    }
    Object.keys(this.configuredTools)
      .filter(tool => this.configuredTools[tool].disabled)
      .forEach(tool => delete this.tools[tool]);
  }

  exists(tool) {
    return Object.keys(this.tools).includes(tool);
  }

  hasController = (tool) => {
    return existsSync(`${this.getToolsFolder()}/${tool}/index.js`);
  };
  
  getController = (tool) => {
    return require(`${this.getToolsFolder().startsWith('.') ? `.${this.getToolsFolder()}` : this.getToolsFolder()}/${tool}`);
  };
}

exports.toolsService = new ToolsService();