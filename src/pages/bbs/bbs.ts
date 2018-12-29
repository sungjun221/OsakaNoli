import { Component }                      from '@angular/core';
import { NavController }                  from 'ionic-angular';
import { AlertController }                from 'ionic-angular';
import { FirebaseBbsService }             from '../../providers/firebase-bbs-service';
import { GlobalVars }                     from '../../providers/global-vars';
import { LoginPage }                      from '../login/login';
import { BbsDetailPage }                  from "../bbs-detail/bbs-detail";
import { Bbs }                            from '../../dtos/bbs-dto';
import { TranslateService }               from '@ngx-translate/core';
import { FirebaseAnalytics }    from '@ionic-native/firebase-analytics';


@Component({
  selector: 'page-bbs',
  templateUrl: 'bbs.html',
})

export class BbsPage {
  bbsList       : any     = [];
  contents      : string;
  loadingBar    : boolean = true;
  emptyLoopList : any     = [];
  isFinish      : boolean = false;
  isLogin       : boolean = false;

  year                  : string = '';
  month                 : string = '';
  day                   : string = '';
  hour                  : string = '';
  minutes               : string = '';
  confirm               : string = '';
  pleaseWrite           : string = '';
  writingComplete       : string = '';
  pleaseLikeAfterLogin  : string = '';

  constructor(private firebaseBbsService  : FirebaseBbsService,
              private firebaseAnalytics   : FirebaseAnalytics,
              private translate           : TranslateService,
              private alertCtrl           : AlertController,
              public  globalVars          : GlobalVars,
              public  navCtr              : NavController) {
    console.log("[bbs-service:()]");
    //this.bbsList = [];
    for(let i=0; i<6; i++){
      this.emptyLoopList.push({1 : '1', 2 : '2', 3 : '3', 4 : '4'});
    }

    translate.get(['BBS_YEAR',
                        'BBS_MONTH',
                        'BBS_DAY',
                        'BBS_HOUR',
                        'BBS_MINUTE',
                        'BBS_CONFIRM',
                        'BBS_PLEASE_WRITE',
                        'BBS_WRITING_COMPLETE',
                        'BBS_PLEASE_LIKE_AFTER_LOGIN']).subscribe(
      values => {
        // value is our translated string
        this.year                 = values.BBS_YEAR;
        this.month                = values.BBS_MONTH;
        this.day                  = values.BBS_DAY;
        this.hour                 = values.BBS_HOUR;
        this.minutes              = values.BBS_MINUTE;
        this.confirm              = values.BBS_CONFIRM;
        this.pleaseWrite          = values.BBS_PLEASE_WRITE;
        this.writingComplete      = values.BBS_WRITING_COMPLETE;
        this.pleaseLikeAfterLogin = values.BBS_PLEASE_LIKE_AFTER_LOGIN;
      }
    );
  }

  ionViewDidEnter() {
    console.log("[bbs-service:ionViewDidEnter()]");
    this.isLogin = this.globalVars.getIsLogin();
    this.loadingBar = true;
    if(this.globalVars.getNeedReloadBbs()=== true){
      this.globalVars.setNeedReloadBbs(false);
      this.initLoadPage();
    }else{
      this.loadingBar = false;
    }
    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('page_view', {page: "bbs"})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  initLoadPage(){
    console.log("[bbs-service:initPage()]");
    this.bbsList = [];
    this.firebaseBbsService.initPage();
    this.loadBbs();
  }

  loadBbs(){
    console.log("[bbs-service:loadBbs()]");

    this.contents = "";
    this.firebaseBbsService.loadBbs().then(snapshot => {
      this.loadingBar = false;
      snapshot.forEach((ss)=>{
        let ssVal = ss.val();
        let bbsNo = Number(ssVal.bbsNo);
        console.log('bbsNo', bbsNo);
        let strRegDate = ssVal.regDate.toString().slice(1);
        let chgRegDate = strRegDate.slice(0,4) + this.year + strRegDate.slice(4, 6) + this.month + strRegDate.slice(6, 8) + this.day
          + strRegDate.slice(8, 10) + this.hour + strRegDate.slice(10, 12) + this.minutes; //+ ':' + strRegDate.slice(12, 14);

        let thumbnailImage = ssVal.thumbnailImage;
        let contents = ssVal.contents;

        let userId = '';
        if(ssVal.userId !== undefined){
          userId = ssVal.userId;
        }

        let platformUserId = '';
        if(ssVal.platformUserId !== undefined){
          platformUserId = ssVal.platformUserId;
        }

        let nickName = '';
        if(thumbnailImage === null || typeof thumbnailImage === undefined){
          nickName = ssVal.nickName.slice(0,5);
        }else{
          nickName = ssVal.nickName;
        }

        let likeCnt = 0;
        if(ssVal.likeCnt !== undefined){
          likeCnt = ssVal.likeCnt;
        }

        let replyCnt = 0;
        if(ssVal.replyCnt !== undefined){
          replyCnt = ssVal.replyCnt;
        }

        let isLike = false;
        if(this.globalVars.getIsLogin() === true && ssVal.likeUsers !== undefined){
          let likeUsers = ssVal.likeUsers;
          let myUserId = this.globalVars.getUser().userId;
          if(myUserId !== null && myUserId !== undefined
              && likeUsers[myUserId] !== null && likeUsers[myUserId] !== undefined ){
            if(likeUsers[myUserId].userId == myUserId){
              isLike = true;
            }
          }
        }

        let country = '';
        if(ssVal.country !== undefined){
          country = ssVal.country;
        }

        this.bbsList.push(new Bbs(bbsNo, userId, platformUserId, nickName, contents, thumbnailImage, chgRegDate, likeCnt, replyCnt, isLike, country, 0));
        this.isFinish = this.firebaseBbsService.getIsFinish();
      });
    });
  }

  handleData(snap) {
    console.log("[bbs-service:handleData()]");
    try {
      //this.bbsList.next(snap.val());
    } catch (error) {
    }
  }

  customAlert(contents) {
    console.log("[bbs-service:customAlert()]");
    let alert = this.alertCtrl.create({
      title: contents,
      buttons: [this.confirm]
    });
    alert.present();
  }

  writeBbs() {
    console.log("[bbs-service:writeBbs()]");

    if(!this.contents){
      this.customAlert(this.pleaseWrite);
      return;
    }
    let writeBtn = document.getElementById('writeBtn');
    writeBtn.style.visibility = "hidden";

    let userId = this.globalVars.getUser().userId;
    let platformUserId = this.globalVars.getUser().platformUserId;
    let nickName = this.globalVars.getUser().nickName;
    this.firebaseBbsService.writeBbs(userId, platformUserId, nickName, this.contents, this.globalVars.getUser().thumbnailImage).then(()=>{
      this.customAlert(this.writingComplete);
      this.contents = "";
      writeBtn.style.visibility = "visible";
      this.initLoadPage();
    });
  }

  thumbsUpAlert(){
    console.log("[bbs-service:thumbsUpAlert()]");
    this.customAlert(this.pleaseLikeAfterLogin);
  }

  thumbsUp(targetBbsNo) {
    console.log("[bbs-service:thumbsUp()]");
    let userId = this.globalVars.getUser().userId;
    console.log('targetBbsNo', targetBbsNo);
    console.log('userId', userId);

    this.firebaseBbsService.thumbsUp(targetBbsNo, userId).then(() => {
      let bbs = this.bbsList.find(x => x.bbsNo == targetBbsNo);
      console.log('bbs', bbs);
      if(bbs !== null && bbs !== undefined){
        bbs.likeCnt++;
        bbs.isLike = true;
      }
    });
  }

  thumbsDown(targetBbsNo) {
    console.log("[bbs-service:thumbsDown()]");
    let userId = this.globalVars.getUser().userId;
    console.log('targetBbsNo', targetBbsNo);
    console.log('userId', userId);

    this.firebaseBbsService.thumbsDown(targetBbsNo, userId).then(() => {
      let bbs = this.bbsList.find(x => x.bbsNo == targetBbsNo);
      console.log('bbs', bbs);
      if(bbs !== null && bbs !== undefined){
        if(bbs.likeCnt > 0){
          bbs.likeCnt--;
        }
        bbs.isLike = false;
      }
    });
  }

  gotoLogin(){
    this.navCtr.push(LoginPage, {
      returnPage : "Bbs"
    });
  }

  doInfinite(infiniteScroll) {
    console.log("[bbs-service:doInfinite()]");

    setTimeout(() => {
      this.loadBbs()
      console.log('Async operation has ended');
      infiniteScroll.complete();
    }, 500);
  }

  gotoDetail(bbsNo, userId, platformUserId, nickName, contents,
             thumbnailImage, regDate, likeCnt, replyCnt, isLike, country){
    console.log("[bbs:gotoDetail()]");
    this.navCtr.push(BbsDetailPage, {
      bbsNo          : bbsNo,
      userId         : userId,
      platformUserId : platformUserId,
      nickName       : nickName,
      contents       : contents,
      thumbnailImage : thumbnailImage,
      regDate        : regDate,
      likeCnt        : likeCnt,
      replyCnt       : replyCnt,
      isLike         : isLike,
      country        : country
    });
  }
}
