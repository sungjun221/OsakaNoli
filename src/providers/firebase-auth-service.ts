import { HttpClient }      from '@angular/common/http';
import { Injectable }      from '@angular/core';
import { FirebaseService } from './firebase-service';
import { Utils } from '../utils/utils';
import { GlobalVars }     from './global-vars';
import firebase from "firebase";

@Injectable()
export class FirebaseAuthService extends FirebaseService{

  constructor(public http: HttpClient,
              public globalVars : GlobalVars) {
    super();
    console.log('[firebase-auth-service:()]');
  }


  test(){
    console.log('>>>>> test <<<<< ');
    this._generateUserId();
/*    firebase.database().ref('bbs').orderByChild('userId').once('value').then((snapshot) => {
      console.log('snapshot', snapshot);
      snapshot.forEach((ss)=>{
        console.log('foreach');
        let ssVal = ss.val();
        console.log('userId', ssVal.userId);
        console.log('bbsNo', ssVal.bbsNo);

        firebase.database().ref('bbs').child(ssVal.bbsNo).child('likeUsers').set('.');
      });
    });*/
  }

  /*  Get userId. However if userId doesn't exist, it creates a new userId and returns it.  */
  getUserId(result) {
    console.log('[firebase-auth-service:getUserId()]');
    console.log('platformUserId', result.id);
    return firebase.database().ref('users').orderByChild('platformUserId').equalTo(result.id).once('value').then((snapshot) => {
      let retUserId = null;
      let loopCnt = 0;
      var exists = (snapshot.val() !== null);

      if(exists === false){
        console.log('snapshot does not exist');
        this.registerUser(result).then((retVal) => {
          console.log('this.registerUser retVal', retVal);
          retUserId = retVal;
        });
      }else{
        snapshot.forEach((ss) => {
          if(loopCnt == 0){
            loopCnt++;
            let ssVal = ss.val();
            let userId = ssVal.userId;
            console.log('- userId', userId);
            if (userId === null || userId === undefined) {
              console.log('this.registerUser() called');
              this.registerUser(result).then((retVal) => {
                console.log('this.registerUser retVal', retVal);
                retUserId = retVal;
              });
              console.log('registerUser > retUserId', retUserId);
            }else{
              console.log('getUserId return userId', userId);
              retUserId = userId;
            }
          }
        });
      }

      console.log('RETURN retUserId', retUserId);
      return retUserId;
    });
  }

  logout() {
    console.log('[firebase-auth-service:logout()]');
    return firebase.auth().signOut();
  }

  private registerUser(result){
    console.log('[firebase-auth-service:registerUser()]');
    return this._generateUserId().then((retVal) => {
      if(retVal == 0 || retVal === null || retVal === undefined){
        return;
      }
      let genUserId = retVal.snapshot.val();
      console.log('genUserId', genUserId);
      let userId = Utils.pad9Digits(genUserId);
      console.log('userId', userId);
      console.log('pad9digit userId', userId);

      let regDate = this.getTimeStamp();
      return firebase.database().ref('users').child(userId).set({
        userId          : userId,
        platformUserId  : result.id,
        platformType    : 'KA',
        nickName        : result.nickname,
        profileImage    : result.profile_image,
        thumbnailImage  : result.thumbnail_image,
        country         : 'KR',
        regDate         : regDate
      }).then(() => {
        return userId;
      });
    });

  }

  private _generateUserId(){
    console.log('[firebase-auth-service:generateUserId()]');
    return firebase.database().ref('counter').child('users').transaction((currentVal) => {
      console.log('>> currentVal', currentVal);
      return currentVal + 1;
    },(err, success, snap)=>{
      let genUserId = snap.val();
      console.log('> genUserId', genUserId);
      return Promise.resolve(genUserId);
    });
  }

  private getTimeStamp(){
    console.log('[firebase-auth-service:getTimeStamp()]');
    let result:any = "";
    firebase.database().ref('timestamp').set(firebase.database['ServerValue']['TIMESTAMP']);
    firebase.database().ref("timestamp").on('value', function(offset) {
      let offsetVal = offset.val() || 0;
      let dateVal ="/Date("+offsetVal+")/";
      let date = new Date(parseFloat(dateVal.substr(6)))
      result = "-" + date.getFullYear() +
        ("0" + (date.getMonth()+1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
    });
    result *= 1;
    return result;
  }

  loginInAnonymously(){
    firebase.auth().signInAnonymously().catch((error)=>{

    }).then(()=>{
      firebase.auth().onAuthStateChanged((user)=>{
        if (user) {
          // User is signed in.
          this.isAnonymous = user.isAnonymous;
          this.uid = user.uid;
          // ...
        } else {
          // User is signed out.
          // ...
        }
        // ...
      });
    });
  }

  /*  Temporary Functions */

  getIsAnonymous(){
    console.log('[firebase-auth-service:getIsAnonymous()]');
    return this.isAnonymous;
  }

  getUid(){
    console.log('[firebase-auth-service:getUid()]');
    return this.uid;
  }

  onAuthStateChanged(_function) {
    console.log('[firebase-auth-service:onAuthStateChanged()]');
    return firebase.auth().onAuthStateChanged((_currentUser) => {
      if (_currentUser) {
        console.log("User " + _currentUser.uid + " is logged in with " + _currentUser.providerId);
        _function(_currentUser);
      } else {
        console.log("User is logged out");
        _function(null);
      }
    })
  }

  currentUser() {
    console.log('[firebase-auth-service:currentUser()]');
    return firebase.auth().currentUser;
  }
}
