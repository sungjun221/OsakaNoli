import {Injectable}          from '@angular/core';
import {SqlService}          from '../providers/sql-service';

@Injectable()
export class SqlChkService {
  keyLang : string = 'LANG';

  constructor(public sqlite:SqlService) {
  }

  public createTable(){
    console.log('[sql-chk-service:createTable()]');
    return this.sqlite.getDb().executeSql('CREATE TABLE IF NOT EXISTS TB_CHK (KEY TEXT, VALUE TEXT)',{}).catch(err => {
      console.error('[sql-chk-service:createTable()] err', err);
    });
  }

  public loadLang(){
    console.log('[sql-chk-service:loadLang()]');
    return this.getKey(this.keyLang);
  }

  public getKey(key) {
    console.log('[sql-chk-service:getKey()]');
    return this.sqlite.getDb().executeSql('SELECT VALUE FROM TB_CHK WHERE KEY = \"' + key + '\"',{});
  }

  public setVal(key, val){
    console.log('[sql-chk-service:setVal()]', key + ' ' + val);
    let sql = 'INSERT INTO TB_CHK (KEY, VALUE) VALUES (?,?)';
    return this.sqlite.getDb().executeSql(sql, [key, val])
      .catch(error=>{
        console.error('[sql-chk-service:setVal()] error : ' + error.message);
      });
  }

  public deleteAllByKey(key){
    console.log('[sql-chk-service:removeAllByKey()]', key);
    let sql = 'DELETE FROM TB_CHK WHERE KEY = ?';
    return this.sqlite.getDb().executeSql(sql, [key])
      .catch(error=>{
        console.error('[sql-chk-service:removeAllByKey()] error : ' + error.message);
      });
  }

  public dropTable(){
    console.log('[sql-chk-service:dropTable()]');
    return this.sqlite.getDb().executeSql('DROP TABLE TB_CHK',{})
      .catch(error=>{
        console.error('[sql-chk-service:dropTable()] error : ' + error.message);
      });
  }

}
