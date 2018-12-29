import { Injectable }        from '@angular/core';
import {SqlService}          from '../providers/sql-service';


@Injectable()
export class SqlAuthService {

  constructor(public sqlite:SqlService) {
  }

  public createTable(){
    console.log("[sql-auth-service:createTable()]");
    return this.sqlite.getDb().executeSql('CREATE TABLE IF NOT EXISTS TB_AUTH ' +
      '(USER_ID TEXT PRIMARY KEY, PLTF_USER_ID TEXT, NICK_NAME TEXT, IMG_PATH TEXT, THUMB_IMG_PATH TEXT, PLTF_TYPE TEXT, COUNTRY TEXT)',{});
  }

  public insertData(userId, platformUserId, name, imgPath, thumbImgPath, platformType, country){
    console.log("[sql-auth-service:insertData()]");
    let sql = 'INSERT INTO TB_AUTH (USER_ID, PLTF_USER_ID, NICK_NAME, IMG_PATH, THUMB_IMG_PATH, PLTF_TYPE, COUNTRY) VALUES (?,?,?,?,?,?,?)';
    return this.sqlite.getDb().executeSql(sql, [userId, platformUserId, name, imgPath, thumbImgPath, platformType, country])
      .catch(error=>{
        console.error('[sql-auth-service:insertData()] error : ', error.message);
        this.dropTable().then(() => {
          this.createTable().then(() =>{
            return this.sqlite.getDb().executeSql(sql, [userId, platformUserId, name, imgPath, thumbImgPath, platformType, country])
          }).catch(error=>{
            console.error('[sql-auth-service:insertData()] second error : ', error.message);
          });
        });
      });
  }

  public getData(){
    console.log("[sql-auth-service:getData()]");
    return this.sqlite.getDb().executeSql('SELECT USER_ID, PLTF_USER_ID, NICK_NAME, IMG_PATH, THUMB_IMG_PATH, PLTF_TYPE, COUNTRY FROM TB_AUTH',{});
  }

  public deleteAllData(){
    console.log("[sql-auth-service:deleteAllData()]");
    let sql = 'DELETE FROM TB_AUTH';
    return this.sqlite.getDb().executeSql(sql, {})
      .catch(error=>{
        console.error('[sql-auth-service:deleteAllData() error', error.message);
      })
  }

  public dropTable(){
    console.log("[sql-auth-service:dropTable()]");
    return this.sqlite.getDb().executeSql('DROP TABLE TB_AUTH',{}).catch(error=>{
      console.error("[sql-auth-service:dropTable()] error : " + error.message);
    });
  }
}
