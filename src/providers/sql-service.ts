import {Injectable}           from '@angular/core';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';


@Injectable()
export class SqlService {
  db              : SQLiteObject     = null;

  constructor(public sqlite:SQLite) {
  }

  public getDb(){
    if(!this.db){
      this.init().then((db: SQLiteObject) => {
        this.db = db;
        return this.db;
      }).catch(e => console.log(e));
    }
    return this.db;
  }

  public setDb(_sqlite){
    this.db = _sqlite;
  }

  private init(){
    return this.sqlite.create({
      name : 'nori.db',
      location : 'default'
    });
  }
}

