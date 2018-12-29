import { Injectable }     from '@angular/core';
import { SqlAuthService } from './sql-auth-service';
import { GlobalVars }     from './global-vars';


@Injectable()
export class AuthService {

  constructor(public globalVars : GlobalVars,
              public sqlAuthService : SqlAuthService) {
  }

  setTestUser(){
    console.log("[auth-service:setTestUser()]");
    let userId = '000000001';
    let result = {
      id : "353834058",
      nickname : "김성준",
      profile_image : "http://mud-kage.kakao.co.kr/14/dn/btqfftumHon/8IMMqSLYsQkhokT02n8NkK/o.jpg",
      thumbnail_image : "http://mud-kage.kakao.co.kr/14/dn/btqfpatAFL3/Y0d6HRHsI0pII2QSbqegMK/o.jpg"
    }

    this.globalVars.setUser(userId, result.id, result.nickname, result.profile_image, result.thumbnail_image, 'KA', 'KR');
  }

  setSessionAndInsertDataWithKakao(userId, result){
    console.log("[auth-service:setSessionAndInsertDataWithKakao()]");
    this.globalVars.setUser(userId, result.id, result.nickname, result.profile_image, result.thumbnail_image, 'KA', 'KR');
    this.sqlAuthService.deleteAllData();
    this.sqlAuthService.insertData(userId, result.id, result.nickname, result.profile_image, result.thumbnail_image, 'KA', 'KR');
  }

  loginChk(){
    console.log("[auth-service:loginChk()]");
    this.sqlAuthService.getData().then(
      data => {
        if(data == null || typeof data == "undefined"){
          console.log('data is null and try login');
          this.globalVars.setUserNull();
        }else{
          console.log('[auth-service:loginChk()] data', data);
          if(data.rows.length > 0){
            //  ID, NAME, IMG_PATH, THUMB_IMG_PATH, TYPE
            console.log('[auth-service:loginChk()] data.rows.length : ' + data.rows.length);
            for(var i = 0; i < data.rows.length; i++){
              let item = data.rows.item(i);
              console.log('[auth-service:loginChk()] item.USER_ID : ' + item.USER_ID);
              console.log('[auth-service:loginChk()] item.PLTF_USER_ID : ' + item.PLTF_USER_ID);
              console.log('[auth-service:loginChk()] item.NICK_NAME : ' + item.NICK_NAME);
              console.log('[auth-service:loginChk()] item.IMG_PATH : ' + item.IMG_PATH);
              console.log('[auth-service:loginChk()] item.THUMB_IMG_PATH : ' + item.THUMB_IMG_PATH);
              console.log('[auth-service:loginChk()] item.PLTF_TYPE : ' + item.PLTF_TYPE);
              console.log('[auth-service:loginChk()] item.COUNTRY : ' + item.COUNTRY);
              this.globalVars.setUser(item.USER_ID, item.PLTF_USER_ID, item.NICK_NAME, item.IMG_PATH, item.THUMB_IMG_PATH, item.PLTF_TYPE, item.COUNTRY);
            }
          }
        }
      }
    ).catch((error)=>{
      console.error('[auth-service:loginChk()] error', error.message);
      this.globalVars.setUserNull();
    });
  }
}
