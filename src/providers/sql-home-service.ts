import { Injectable }          from '@angular/core';
import { FileIoService }       from './file-io-service';
import { SqlService }          from '../providers/sql-service';
import { GlobalVars }          from '../providers/global-vars';

export class Home{
  id        : string;
  name      : string;
  desc      : string;
  imgPath   : string;

  constructor(id: string, name: string, desc: string, imgPath: string){
    this.id       = id;
    this.name     = name;
    this.desc     = desc;
    this.imgPath  = imgPath;
  }
}

@Injectable()
export class SqlHomeService {
  homes            : any         = [];
  loadingComplete  : boolean     = false;

  constructor(private fileIoService  : FileIoService,
              private sqlite         : SqlService,
              public globalVars     : GlobalVars) {
    console.log("[sql-home-service:()]");
  }

  public getCnt(){
    console.log("[sql-home-service:getCnt()]");
    return this.sqlite.getDb().executeSql('SELECT count(ID) AS cnt FROM TB_HOME',{})
      .catch(error=>{
        console.error('[sql-home-service:getSightsCnt()] error. : ' + error.message);
      });
  }

  public insertData(lang:string){
    console.log("[sql-home-service:insertData()] lang");
    return this.createTable().then(() => {
      return this._insertData('assets/data/' + lang + '/home.json');
    });
  }

  public createTable(){
    console.log("[sql-home-service:createTable()]");
    return this.sqlite.getDb().executeSql('CREATE TABLE IF NOT EXISTS TB_HOME ' +
      '(ID TEXT PRIMARY KEY, NAME TEXT, DESC TEXT, IMG_PATH TEXT)',{});
  }

  public getList(){
    console.log("[sql-home-service:getList()]");
    return this.sqlite.getDb().executeSql('SELECT ID, NAME, DESC, IMG_PATH FROM TB_HOME',{});
  }

  private _insertData(jsonPath){
    console.log("[sql-home-service:_insertData()] jsonPath : " + jsonPath);
    let sql = 'INSERT INTO TB_HOME (ID, NAME, DESC, IMG_PATH) '
      + 'VALUES (?, ?, ?, ?)';

    this.fileIoService.load(jsonPath)
      .then(data => {
        this.homes = data;
        var promises = [];
        for (var home of this.homes) {
          console.log('[sql-home-service:_insertData()] data home.id:'+home.id+',name:'+home.name);
          promises.push(this.sqlite.getDb().executeSql(sql,[home.id, home.name, home.desc, home.imgPath]).catch((error)=>{
            console.error("[sql-home-service:_insertData()] insert data error : " + error.message);
          }));
        }
        Promise.all(promises).then(()=>{
          console.log('[sql-home-service:_insertData()] setLoadingComplete true');
          this.setLoadingComplete(true);
        });
      }).catch( error => {
        console.error("[sql-home-service:_insertData()] read file data error : " + error.message);
      })
  }

  public isLoadingComplete(){
    console.log("[sql-home-service:isLoadingComplete()] : " + this.loadingComplete);
    return this.loadingComplete;
  }

  public setLoadingComplete(flag){
    console.log("[sql-home-service:setLoadingComplete()] flag : " + flag);
    this.loadingComplete = flag;
  }

  public dropTable(){
    console.log("[sql-home-service:dropTable()]");
    this.sqlite.getDb().executeSql('DROP TABLE TB_HOME',{}).catch(error=>{
      console.error("[sql-home-service:dropTable()] error : " + error.message);
    });
  }

  public delete(){
    console.log("[sql-home-service:delete()]");
    return this.sqlite.getDb().executeSql('DELETE FROM TB_HOME',{}).catch(error=>{
      console.error("[sql-home-service:delete()] error : " + error.message);
    });
  }
}


