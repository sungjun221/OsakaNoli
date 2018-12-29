import { Injectable }             from '@angular/core';
import {SqlService}               from '../providers/sql-service';
import {SqlHomeService}           from '../providers/sql-home-service';
import {SqlSightService}          from '../providers/sql-sight-service';
import {SqlFavService}            from "../providers/sql-fav-service";
import {SqlChkService}            from "../providers/sql-chk-service";
import {SqlAuthService}           from "../providers/sql-auth-service";
import {AuthService}              from "../providers/auth-service";
import { GlobalVars }             from '../providers/global-vars';
import {SQLite, SQLiteObject}     from '@ionic-native/sqlite';
import { TranslateService }       from '@ngx-translate/core';

@Injectable()
export class LoadService {
  IS_INSERT  : string = "IS_INSERT";
  LANG       : string = "LANG";

  constructor(public globalVars       : GlobalVars,
              private sqlite          : SQLite,
              private sqlService      : SqlService,
              private sqlChkService   : SqlChkService,
              private sqlHomeService  : SqlHomeService,
              private sqlSightService : SqlSightService,
              private sqlFavService   : SqlFavService,
              private sqlAuthService  : SqlAuthService,
              private translate      : TranslateService,
              private authService     : AuthService) {
  }

  public load(lang:string){
    console.log('[load-service:load()]', lang);
    this.sqlite.create({
        name: 'nori.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
        this.sqlService.setDb(db);
        console.log("- Load STEP 01. DATABASE OPEN SUCCESS");
        //  for test : all drop the tables.
        //this.sqlAuthService.dropTable();
        console.log("- Load STEP 02. CREATE TABLE");
        this.createTables()
          .then(() => {
            console.log("- Load STEP 03. LOAD LANGUAGE");
            return this.loadLang(lang);
          })
          .then(() => {
            console.log("- Load STEP 04. CHECK LOGIN");
            return this.authService.loginChk();
          }).then(() => {
          console.log("- Load STEP 05. CHECK IF HOME DATA EXISTS");
            return this.sqlHomeService.getCnt()
          }).then((data) => {
            if(data.rows.item(0).cnt > 0){
              console.log("- Load STEP 05-1. DATA EXISTS");
              console.log('>> data.rows.item(0).cnt > 0');
              return Promise.resolve();
            }else{
              console.log("- Load STEP 05-2. INSERT HOME DATA");
              console.log('>> data.rows.item(0).cnt == 0');
              return this.sqlHomeService.insertData(lang);
            }
          }).then(() => {
            console.log("- Load STEP 05-3. SET HOME LOADING COMPLETE");
            this.sqlHomeService.setLoadingComplete(true);
            console.log("- Load STEP 06. CHECK IF SIGHT DATA EXISTS");
            return this.sqlSightService.getCnt();
          }).then( data => {
            if(data.rows.item(0).cnt > 0){
              console.log("- Load STEP 06-1. DATA EXISTS");
              console.log('>>> data.rows.item(0).cnt > 0');
              return Promise.resolve();
            }else {
              console.log("- Load STEP 06-2. INSERT SIGHT DATA");
              console.log('>>> data.rows.item(0).cnt == 0');
              console.log('[load-service:load()] SIGHT data === null or undefined');
              return this.sqlSightService.insertData(lang);
            }
        }).then(() => {
          console.log("- Load STEP 6-3. SET SIGHT LOADING COMPLETE");
          this.sqlSightService.setLoadingComplete(true);
        });
      });
  }

  private loadLang(lang:string){
    console.log('[load-service:loadLang()]');
    return this.sqlChkService.loadLang().then((data) =>{
        console.log('- load lang data.rows.length', data.rows.length);
        if(data.rows.length > 0){
          console.log("- Load STEP 03-1. GET LANG FROM DB");
          for(var i = 0; i < data.rows.length; i++){
            let item = data.rows.item(i);
            console.log('- load lang item.VALUE', item.VALUE);
            this.setLang(item.VALUE);
          }
        }else{
          console.log("- Load STEP 03-2. NO LANG & INSERT LANG TO DB");
          this.initLang();
          console.log(' - insert lang', this.globalVars.getLang());
          this.sqlChkService.deleteAllByKey(this.LANG).then(() => {
            this.sqlChkService.setVal(this.LANG, this.globalVars.getLang());
          })
          this.setLang(lang);
        }
      }).catch((err) => {
        console.log('error occured', err);
      });
  }

  initLang() {
    console.log("[load-service:initLang()]");
    const browserLang = this.translate.getBrowserLang();
    console.log("- browserLang", browserLang);

    if (browserLang) {
      if (browserLang !== 'ko') {
        this.globalVars.setLang('en')
      } else {
        this.globalVars.setLang('ko');
      }
    }
  }

  setLang(lang:string){
    console.log('[load-service:setLang()] lang', lang);
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
    this.globalVars.setLang(lang);
  }

  private createTables(){
    console.log('[load-service:createTables()]');
    return this.sqlAuthService.createTable()
      .then(() => {
      return this.sqlHomeService.createTable();
    }).then(() => {
        return this.sqlSightService.createTable();
    }).then(() => {
      return this.sqlFavService.createTable();
    }).then(() => {
      return this.sqlChkService.createTable();
    });
  }

  public deleteAndInsert(lang:string){
    console.log('[load-service:deleteAndInsert()] lang', lang);

    return this.deleteData().then(() => {
      return this.sqlChkService.deleteAllByKey(this.LANG);
    }).then(() => {
      return this.sqlChkService.setVal(this.LANG, lang);
    }).then(() => {
      return this.sqlHomeService.insertData(lang);
    }).then(() => {
      return this.sqlSightService.insertData(lang);
    });
  }

  private deleteData(){
    console.log('[load-service:deleteData()]');
    return this.sqlHomeService.delete()
      .then(() => {
        return this.sqlSightService.delete();
      });
  }

  /*private insertData(lang:string){
    console.log('[load-service:insertData()]');
    this.sqlHomeService.insertData(lang);
    this.sqlSightService.insertData(lang);
    this.sqlChkService.setVal(this.IS_INSERT, "1.0");
    this.loadingComplete();
  }*/

  /*private loadingComplete(){
    console.log('[load-service:loadingComplete()]');
    this.sqlHomeService.setLoadingComplete(true);
    this.sqlSightService.setLoadingComplete(true);
  }*/

  public testAllDropTables(){
    console.log('[load-service:testAllDropTables()]');
    this.sqlAuthService.dropTable();
    this.sqlFavService.dropTable();
    this.sqlChkService.dropTable();
    this.sqlHomeService.dropTable();
    this.sqlSightService.dropTable();
  }

}
