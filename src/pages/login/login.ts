import { Component }                   from '@angular/core';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { GlobalVars }                  from '../../providers/global-vars';
import { AuthService }                 from '../../providers/auth-service';
import { FirebaseAuthService }         from '../../providers/firebase-auth-service';
import { TranslateService }            from '@ngx-translate/core';
import { LoadService }                 from "../../providers/load-service";
import { FirebaseAnalytics }    from '@ionic-native/firebase-analytics';

declare var KakaoTalk: any;

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {
  returnPage        : string = 'Home';

  pleaseLogin       : string = '';
  logout            : string = '';
  welcome           : string = '';
  failed            : string = '';
  bye               : string = '';
  logoutProblem     : string = '';
  confirm           : string = '';

  constructor(public navCtr              : NavController,
              public navParams           : NavParams,
              public globalVars          : GlobalVars,
              private alertCtrl           : AlertController,
              private authService         : AuthService,
              private firebaseAuthservice : FirebaseAuthService,
              private firebaseAnalytics: FirebaseAnalytics,
              private translate           : TranslateService,
              private loadService         : LoadService) {
    console.log("[login:()]");
    if(navParams.get('returnPage')){
      this.returnPage = navParams.get('returnPage');
    }

    translate.get(['LOGIN_PLEASE_LOGIN',
                        'LOGIN_LOGOUT',
                        'LOGIN_WELCOME',
                        'LOGIN_FAILED',
                        'LOGIN_BYE',
                        'LOGIN_LOGOUT_PROBLEM',
                        'LOGIN_CONFIRM']).subscribe(
      values => {
        // value is our translated string
        this.pleaseLogin      = values.LOGIN_PLEASE_LOGIN;
        this.logout           = values.LOGIN_LOGOUT;
        this.welcome          = values.LOGIN_WELCOME;
        this.failed           = values.LOGIN_FAILED;
        this.bye              = values.LOGIN_BYE;
        this.logoutProblem    = values.LOGIN_LOGOUT_PROBLEM;
        this.confirm          = values.LOGIN_CONFIRM;
      }
    );
  }

  ionViewDidEnter() {
    console.log("[login:ionViewDidEnter()] returnPage", this.returnPage);
    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('page_view', {page: "login"})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  loginWithKakao() {
    console.log("[login:loginWithKakao()]");

    var self = this;
    self.globalVars.setNeedReloadBbs(true);

    KakaoTalk.login(
      function (result) {
        console.log('result', result);
        console.log('result.id', result.id);
        self.customAlert('어서오세요 ^^');

        self.firebaseAuthservice.getUserId(result).then((userId)=>{
          console.log('KakaoTalk.login userId', userId);
          if(userId == null || userId == undefined){
            console.log('userId == null || userId == undefined');
            return;
          }
          self.authService.setSessionAndInsertDataWithKakao(userId, result);
          self.gotoReturnPage(self);
        });
      },
      function (message) {
        console.log("   KakaoTalk.login error");
        self.customAlert('로그인이 실패하였습니다. : ' + message);
        self.logoutSetting(self);
        self.gotoReturnPage(self);
      }
    );

    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('event', {page: "login", name: "loginWithKakao"})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  test(){
    console.log('test')
    //this.firebaseAuthservice.test();
  }

  logoutWithKakao(){
    console.log("[login:logoutWithKakao()]");
    var self = this;
    KakaoTalk.logout(
      function() {
        self.customAlert('안녕히 가세요 ^^');
        self.logoutSetting(self);
      }, function() {
        self.customAlert('로그아웃 중 문제가 발생하였습니다.');
        self.logoutSetting(self);
      }
    );
    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('event', {page: "login", name: "logoutWithKakao"})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }


  logoutSetting(self){
    console.log("[login:logoutSetting()]");
    this.returnPage = "Home";
    self.globalVars.setIsLogin(false);
    self.globalVars.setUserNull();
    self.gotoReturnPage(self);
  }


  gotoReturnPage(self){
    console.log("[login:gotoReturnPage()]");
    self.navCtr.setRoot(LoginPage);
  }

  customAlert(contents) {
    console.log("[login:customAlert()]");
    let alert = this.alertCtrl.create({
      title: contents,
      buttons: [this.confirm]
    });
    alert.present();
  }

  radioAlert() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Language');

    let koChecked = false;
    let enChecked = false;

    if(this.globalVars.getLang() === 'en'){
      enChecked = true;
    }else{
      koChecked = true;
    }

    alert.addInput({
      type: 'radio',
      label: '한국어',
      value: 'ko',
      checked: koChecked
    });
    alert.addInput({
      type: 'radio',
      label: 'English',
      value: 'en',
      checked: enChecked
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        console.log('radioAlert result',data);
        this.changeLanguage(data);
        this.customAlert('This change is complete.');
      }
    });
    alert.present();
  }


  selectLang() {
    console.log("[login:selectLang()]");
    this.radioAlert();
  }

  private changeLanguage(lang:string){
    console.log("[login:changeLanguage()] lang", lang);
    if (this.globalVars.getLang() !== lang) {
      this.loadService.setLang(lang);
      this.globalVars.setNeedReloadHome(true);
      this.globalVars.getNeedReloadSight().setNeedReload(true, true, true, true, true);
      this.loadService.deleteAndInsert(lang);

    }
    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('event', {page: "login", name: "changeLanguage", lang:lang})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

}
