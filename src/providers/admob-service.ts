import { Injectable }                       from '@angular/core';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';

@Injectable()
export class AdmobService {
  admobId    : any;

  constructor(private admobFree: AdMobFree) {
  }

  public create(){
    console.log("[AdmobService:create()]");
    if(/(android)/i.test(navigator.userAgent)) {
      this.admobId = {
        banner : 'ca-app-pub-4377691726838709/1814196676',
        interstitial: 'ca-app-pub-4377691726838709/3290929875'
      };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
      this.admobId = {
        banner : 'ca-app-pub-4377691726838709/7420078278',
        interstitial: 'ca-app-pub-4377691726838709/7001275878'
      };
    }else{
      return;
    }

    const bannerConfig: AdMobFreeBannerConfig = {
      id       :  this.admobId.banner,
      isTesting: false,
      bannerAtTop : true,
      offsetTopBar : true,
      autoShow :  true
    };
    this.admobFree.banner.config(bannerConfig);

    this.admobFree.banner.prepare()
      .then(() => {
        // banner Ad is ready
        // if we set autoShow to false, then we will need to call the show method here
      })
      .catch(e => console.log(e));
  }

}
