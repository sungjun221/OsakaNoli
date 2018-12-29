import {Injectable}          from '@angular/core';
import {SqlService}          from '../providers/sql-service';

export class Fav{
  id         : string;
  grpId      : string;
  name       : string;
  thumbPath  : string;

  constructor(id: string, grpId: string, name: string, thumbPath: string){
    this.id        = id;
    this.grpId     = grpId;
    this.name      = name;
    this.thumbPath = thumbPath;
  }
}

@Injectable()
export class SqlFavService {

  constructor(public sqlite:SqlService) {
    console.log("[sql-fav-service:()]");
  }

  public getFavByGrpId(grpId) {
    console.log("[sql-fav-service:getFavByGrpId()]");
    return this.sqlite.getDb().executeSql('SELECT ID, GRP_ID, NAME, THUMB_PATH, ID FROM TB_FAV WHERE GRP_ID = \"' + grpId + '\"',{});
  }

  public getFavBySightId(id){
    console.log("[sql-fav-service:getFavBySightId()]");
    return this.sqlite.getDb().executeSql('SELECT ID, GRP_ID, NAME, THUMB_PATH, ID FROM TB_FAV WHERE ID = \"' + id + '\"',{});
  }

  public insertFav(id, grpId, name, imgPath) {
    console.log("[sql-fav-service:insertFav()]");
    let sql = 'INSERT INTO TB_FAV (ID, GRP_ID, NAME, THUMB_PATH) VALUES (?,?,?,?)';
    return this.sqlite.getDb().executeSql(sql, [id, grpId, name, imgPath]);
  }

  public updateFav(id, grpId) {
    console.log("[sql-fav-service:updateFav()]");
    let sql = 'UPDATE TB_FAV SET SIGHT_ID = \"' + id + '\", GRP_ID = \"' + grpId + '\" WHERE ID = \"' + id + '\"';
    return this.sqlite.getDb().executeSql(sql,{});
  }

  public removeFav(id) {
    console.log("[sql-fav-service:removeFav()]");
    let sql = 'DELETE FROM TB_FAV WHERE ID = \"' + id + '\"';
    return this.sqlite.getDb().executeSql(sql,{});
  }

  public createTable(){
    console.log("[sql-fav-service:createTable()]");
    return this.sqlite.getDb().executeSql('CREATE TABLE IF NOT EXISTS TB_FAV (ID TEXT, GRP_ID TEXT, NAME TEXT, THUMB_PATH TEXT)',{});
  }

  public dropTable(){
    console.log("[sql-fav-service:dropTable()]");
    return this.sqlite.getDb().executeSql('DROP TABLE IF EXISTS TB_FAV',{});
  }
}

