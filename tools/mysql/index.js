const mysql = require('mysql');

class MysqlConnector {
  constructor(url, query) {
    this.url = url;
    this.sqlQuery = query;
  }

  async execute() {
    let result = undefined;
    try {
      await this.connect();
      result = await this.query();
    } catch (err) {
      console.error(err);
    } finally {
      await this.end();
    }
    return result;
  }

  createConnection(db = '') {
    return mysql.createConnection(`${this.url}`, {multipleStatements: true})
  }


  async connect() {
    if (!this.connected) {
      console.log(`Connecting to mysql on ${this.url}`);
      this.connection = this.createConnection();
      return new Promise((resolve, reject) => {
        this.connection.connect((err) => {
          if (err) return reject(err);
          this.connected = true;
          resolve();
        });
      });
    }
  }

  async end() {
    if (this.connected) {
      console.log(`Ending connection to mysql on ${this.url}`);
      return new Promise((resolve, reject) => {
        this.connection.end((err) => {
          if (err) return reject(err);
          this.connected = false;
          resolve();
        });
      });
    }
    
  }

  async query() {
    if (this.connected) {
      console.log(`Querying to mysql on ${this.url}`);
      return new Promise( ( resolve, reject ) => {
        this.connection.query( this.sqlQuery, undefined, ( err, rows ) => {
            if ( err )
                return reject( err );
            resolve( rows );
        } );
      });
    }
  }
}


exports.controller = async (reqData) => {
  let url = reqData.url;
  let sql = reqData.sql;
  
  if (url && sql) {
    const connection = new MysqlConnector(url, sql.replace(/\n/g,' '));
    const result = await connection.execute();
    return result;
  }

}