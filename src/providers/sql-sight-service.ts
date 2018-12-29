import { Injectable }          from '@angular/core';
import { FileIoService }       from './file-io-service';
import { SqlService }          from '../providers/sql-service';
import { GlobalVars }          from '../providers/global-vars';

export class Sight{
  id        : string;
  name      : string;
  desc      : string;
  thumbPath : string;
  grpId     : string;

  constructor(id: string, name: string, desc: string, thumbPath: string, grpId: string){
    this.id         = id;
    this.name       = name;
    this.desc       = desc;
    this.thumbPath  = thumbPath;
    this.grpId      = grpId;
  }
}

export class SightDetail{
  id        : string;
  name      : string;
  desc      : string;
  time      : string;
  way       : string;
  fee       : string;
  url       : string;
  mapLat    : number;
  mapLng    : number;
  thumbPath : string;
  imgPath   : string;
  grpId     : string;

  constructor(id: string, name: string, desc: string, time: string,
  way: string, fee: string, url: string, mapLat: number, mapLng: number, thumbPath: string, imgPath: string, grpId: string){
    this.id        = id;
    this.name      = name;
    this.desc      = desc;
    this.time      = time;
    this.way       = way;
    this.fee       = fee;
    this.url       = url;
    this.mapLat    = mapLat;
    this.mapLng    = mapLng;
    this.thumbPath = thumbPath;
    this.imgPath   = imgPath;
    this.grpId     = grpId;
  }
}

@Injectable()
export class SqlSightService {
  sights          : any         = [];
  loadingComplete : boolean     = false;
  promises        : any         = [];

  constructor(private fileIoService : FileIoService,
              private sqlite        : SqlService,
              public globalVars    : GlobalVars) {
  }

  public createTable(){
    console.log('[sql-sight-service:createTable()]');
    return this.sqlite.getDb().executeSql('CREATE TABLE IF NOT EXISTS TB_SIGHT ' +
      '(ID TEXT PRIMARY KEY, NAME TEXT, DESC TEXT, TIME TEXT, WAY TEXT, FEE TEXT, URL TEXT, ' +
      ' MAP_LAT INTEGER, MAP_LNG INTEGER, THUMB_PATH TEXT, IMG_PATH TEXT, GRP_ID TEXT)',{})
      .then(()=>{
        console.log('[sql-sight-service:createTable()] create table success.');
      })
      .catch(error=>{
        console.error('[sql-sight-service:createTable()] create table failed. : ' + error.message);
      });
  }

  public getCnt(){
    console.log('[sql-sight-service:getCnt()]');
    return this.sqlite.getDb().executeSql('SELECT count(ID) AS cnt FROM TB_SIGHT',{})
      .catch(error=>{
        console.error('[sql-sight-service:getSightsCnt()] error. : ' + error.message);
      });
  }

  public getAllSights(){
    console.log('[sql-sight-service:getAllSights()]');
    return this.sqlite.getDb().executeSql('SELECT ID, NAME, MAP_LAT, MAP_LNG, THUMB_PATH, GRP_ID FROM TB_SIGHT',{})
      .catch(error=>{
        console.error('[sql-sight-service:getAllSights()] error. : ' + error.message);
      });
  }

  public getSightsByGrpId(grpId){
    console.log('[sql-sight-service:getSightsByGrpId()]');
    return this.sqlite.getDb().executeSql('SELECT ID, NAME, DESC, THUMB_PATH, GRP_ID FROM TB_SIGHT WHERE GRP_ID = \"' + grpId + '\"',{})
      .catch(error=>{
        console.error('[sql-sight-service:getSightsByGrpId()] error. : ' + error.message);
      });
  }

  public getSightDetailById(grpId, id){
    console.log('[sql-sight-service:getSightDetailById()]');
    return this.sqlite.getDb().executeSql('SELECT ID, NAME, DESC, TIME, WAY, FEE, URL, ' +
                                      'MAP_LAT, MAP_LNG, THUMB_PATH, IMG_PATH, GRP_ID ' +
                                'FROM TB_SIGHT WHERE GRP_ID = \"' + grpId + '\" ' +
                                  ' AND ID = \"' + id + '\"',{})
      .catch(error=>{
        console.error('[sql-sight-service:getSightDetailById()] error. : ' + error.message);
      });
  }

  public insertData(lang:string) {
    console.log('[sql-sight-service:insertData()] lang');
    return this.createTable().then(() => {
      let jsonDatas =
        [
          'assets/data/' + lang + '/sight-minami.json',
          'assets/data/' + lang + '/sight-kita.json',
          'assets/data/' + lang + '/sight-osakacastle.json',
          'assets/data/' + lang + '/sight-tennoji.json',
          'assets/data/' + lang + '/sight-bayarea.json'
        ];

      for(var jsonData of jsonDatas){
        this._insertData(jsonData)
      }
      this._insertComplete();
    });
  }

  private _insertData(jsonPath){
    console.log('[sql-sight-service:_insertData()] jsonPath : ' +jsonPath);
    let sql = 'INSERT INTO TB_SIGHT (ID, NAME, DESC, TIME, WAY, FEE, URL, MAP_LAT, MAP_LNG, THUMB_PATH, IMG_PATH, GRP_ID)'
      + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    this.fileIoService.load(jsonPath)
      .then(data => {
        this.sights = data;
        for (var sight of this.sights) {
          console.log('[sql-sight-service:_insertData()]data sight.id:'+sight.id+',name:'+sight.name+',grpId:'+sight.grpId);
          this.promises.push(
            this.sqlite.getDb().executeSql(sql,
              [sight.id, sight.name, sight.desc, sight.time, sight.way, sight.fee, sight.url,
                sight.mapLat, sight.mapLng, sight.thumbPath, sight.imgPath, sight.grpId])
              .catch((error)=>{
                console.log('sight.id', sight.id);
                console.log('sight.name', sight.name);
                console.error('[sql-sight-service:_insertData()] insert data failed. : ' + error.message);
              })
          );
        }
      }).catch(error=>{
        console.error('[sql-sight-service:_insertData()] read file data failed. : ' + error.message);
      });
  }

  private _insertComplete(){
    console.log('[sql-sight-service:_insertComplete()]');
    Promise.all(this.promises).then(()=>{
      this.loadingComplete = true;
    }).catch(error=>{
      console.error('[sql-sight-service:_insertComplete()] error. : ' + error.message);
    });
  }

  public isLoadingComplete(){
    console.log('[sql-sight-service:isLoadingComplete()]');
    return this.loadingComplete;
  }

  public setLoadingComplete(flag){
    console.log('[sql-sight-service:setLoadingComplete()]');
    this.loadingComplete = flag;
  }

  public dropTable(){
    console.log('[sql-sight-service:dropTable()]');
    return this.sqlite.getDb().executeSql('DROP TABLE TB_SIGHT',{}).catch(error=>{
      console.error('[sql-sight-service:dropTable()] error : ' + error.message);
    });
  }

  public delete(){
    console.log('[sql-sight-service:delete()]');
    return this.sqlite.getDb().executeSql('DELETE FROM TB_SIGHT',{}).catch(error=>{
      console.error('[sql-sight-service:delete()] error : ' + error.message);
    });
  }
}

