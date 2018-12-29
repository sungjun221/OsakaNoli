import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {MyApp} from './app.component';
import {TabsPage} from '../pages/tabs/tabs';
import {LoginPage} from '../pages/login/login';
import {BbsPage} from '../pages/bbs/bbs';
import {BbsDetailPage} from '../pages/bbs-detail/bbs-detail';
import {MapPage} from '../pages/map/map';
import {FavPage} from '../pages/fav/fav';
import {HomePage} from '../pages/home/home';
import {FindPathPage} from '../pages/findPath/findPath';
import {SightPage} from '../pages/sight/sight';
import {SightDetailPage} from '../pages/sight-detail/sight-detail';
import {CafePage} from '../pages/cafe/cafe';
import {TransPage} from '../pages/trans/trans';

import {SqlService} from '../providers/sql-service';
import {SqlHomeService} from '../providers/sql-home-service';
import {SqlSightService} from '../providers/sql-sight-service';
import {SqlFavService} from "../providers/sql-fav-service";
import {SqlChkService} from "../providers/sql-chk-service";
import {SqlAuthService} from '../providers/sql-auth-service';
import {ConnectivityService} from '../providers/connectivity-service';
import {FileIoService} from "../providers/file-io-service";
import {AuthService} from "../providers/auth-service";
import {GlobalVars} from "../providers/global-vars";
import {AdMobFree} from '@ionic-native/admob-free';
import {SQLite} from '@ionic-native/sqlite';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {Geolocation} from '@ionic-native/geolocation';
import {Network} from '@ionic-native/network';
import {FirebaseService} from '../providers/firebase-service';
import {FirebaseBbsService} from '../providers/firebase-bbs-service';
import {FirebaseBbsReplyService} from '../providers/firebase-bbs-reply-service';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    BbsPage,
    BbsDetailPage,
    MapPage,
    FavPage,
    HomePage,
    FindPathPage,
    SightPage,
    SightDetailPage,
    TransPage,
    CafePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    BbsPage,
    BbsDetailPage,
    MapPage,
    FavPage,
    HomePage,
    FindPathPage ,
    SightPage,
    SightDetailPage,
    TransPage,
    CafePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    InAppBrowser,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ConnectivityService, SqlService, SqlHomeService,
    SqlSightService, SqlFavService, SqlChkService,
    SqlAuthService, FileIoService, AuthService,
    AdMobFree,
    Geolocation,
    Network,
    FirebaseAnalytics,
    FirebaseService, FirebaseBbsService, FirebaseBbsReplyService,
    SQLite, GlobalVars]
})
export class AppModule {}
