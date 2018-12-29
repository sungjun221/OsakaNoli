import {Component, ElementRef, ViewChild} from '@angular/core';
import {ConnectivityService}              from '../../providers/connectivity-service';
import {Geolocation}                      from '@ionic-native/geolocation';
import {NavParams}                        from "ionic-angular/index";
import {Platform}                         from 'ionic-angular';
import {InAppBrowser}                     from '@ionic-native/in-app-browser';
import { TranslateService }               from '@ngx-translate/core';
import { FirebaseAnalytics }              from '@ionic-native/firebase-analytics';

declare var google;

@Component({
  selector: 'page-find-path',
  templateUrl: 'findPath.html',
})
export class FindPathPage {

  @ViewChild('map') mapElement: ElementRef;

  map            : any;
  mapInitialised : boolean = false;
  apiKey         : any     = 'AIzaSyD9jlz4vd-E_C23shx5KXIiir2oy4F_rp8';
  mapLat         : number;
  mapLng         : number;
  name           : string;
  thumbPath      : string;
  id             : string;
  grpId          : string;

  orgName        : string;
  distance       : string;
  duration       : string;

  currLat        : number;
  currLng        : number;

  seeTransInfo   : boolean = false;
  loadingBar     : boolean = true;

  noRoute        : string = '';
  tryOsakaNear   : string = '';
  dpet           : string = '';
  dest           : string = '';
  byCar          : string = '';

  constructor(private iab                 : InAppBrowser,
              private geolocation         : Geolocation,
              private navParams           : NavParams,
              private connectivityService : ConnectivityService,
              private platform            : Platform,
              private firebaseAnalytics: FirebaseAnalytics,
              private translate           : TranslateService) {
    console.log("[findPath:()]");
    this.mapLat    = navParams.get('mapLat') || 34.661996;
    this.mapLng    = navParams.get('mapLng') || 135.501935;
    this.currLat   = 34.609262;         //  그냥 임의의 좌표
    this.currLng   = 135.552087;
    this.name      = navParams.get('name');
    this.thumbPath = navParams.get('thumbPath');
    this.id        = navParams.get('id');
    this.grpId     = navParams.get('grpId');

    translate.get([
      'FIND_NO_ROUTE',
      'FIND_TRY_OSAKA_NEAR',
      'FIND_DEPT',
      'FIND_DEST',
      'FIND_BY_CAR']).subscribe(
      values => {
        this.noRoute          = values.FIND_NO_ROUTE;
        this.tryOsakaNear     = values.FIND_TRY_OSAKA_NEAR;
        this.dpet             = values.FIND_DEPT;
        this.dest             = values.FIND_DEST;
        this.byCar            = values.FIND_BY_CAR;
      });
  }

  ionViewDidEnter() {
    console.log("[findPath:ionViewDidEnter()]");
    this.connectivityService.startSubscribe();
    this.loadingBar = true;
    this.loadGoogleMaps();

    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('page_view', {page: "findPath", mapName: this.name})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }


  ionViewWillLeave() {
    this.connectivityService.endSubscribe();
  }


  loadGoogleMaps(){
    console.log("[findPath:loadGoogleMaps()]");
    this.addConnectivityListeners();

    if(typeof google == "undefined" || typeof google.maps == "undefined"){
      console.log("Google maps JavaScript needs to be loaded.");
      this.disableMap();

      if(this.connectivityService.isOnline()){
        console.log("online, loading map");

        //Load the SDK
        window['mapInit'] = () => {
          this.initMapByPos();
          this.enableMap();
        }
        let script = document.createElement("script");
        script.id = "googleMaps";

        if(this.apiKey){
          script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
        } else {
          script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
        }
        document.body.appendChild(script);
      }
    }
    else {
      if(this.connectivityService.isOnline()){
        console.log("showing map");
        //this.initMap();
        this.initMapByPos();
        this.enableMap();
      }
      else {
        console.log("disabling map");
        this.disableMap();
      }
    }
  }


  initMapByPos() {
    console.log("[findPath:initMapByPos()]");
    let dest = new google.maps.LatLng(this.mapLat, this.mapLng);
    let mapOptions = {
      zoom: 15
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(this.map);
    // Wait until the map is loaded
    google.maps.event.addListenerOnce(this.map, 'idle', function(){
      //this.enableMap();
    });
    this.mapInitialised = true;
    this.geolocation.getCurrentPosition().then((position) => {
      this.loadingBar = false;
      var myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      // todo : 임시좌표
      //var myPos = new google.maps.LatLng(34.609262, 135.552087);
      console.log("[findPath:initMapByPos()] position : " + position.coords.latitude + ", " + position.coords.longitude);
      console.log("[findPath:initMapByPos()] dest position : " + this.mapLat + ", " + this.mapLng);
      this.currLat = position.coords.latitude;
      this.currLng = position.coords.longitude;
      this.calRoute(directionsService, directionsDisplay, myPos, dest);
      this.calDistance(myPos, dest);
    }).catch((err)=>{
      this.loadingBar = false;
      alert(err);
    });
  }


  calRoute(directionsService, directionsDisplay, org, dest) {
    console.log("[findPath:calRoute()]");
    directionsService.route({
      origin: org,
      destination: dest,
      travelMode: google.maps.TravelMode.DRIVING
    }, (res, st)=> {
      this.callbackCalRoute(res, st, this, directionsDisplay);
    });
  }


  callbackCalRoute(response, status, self, directionsDisplay) {
    console.log("[findPath:callbackCalRoute()]");
    if (status === google.maps.DirectionsStatus.OK) {
      self.seeTransInfo = true;
      directionsDisplay.setDirections(response);
    } else {
      if(status === 'ZERO_RESULTS'){
        self.seeTransInfo = false;
        document.getElementById('orgName').innerHTML  = this.noRoute;
        document.getElementById('destName').innerHTML = this.tryOsakaNear;
        document.getElementById('distance').innerHTML = '';
        document.getElementById('duration').innerHTML = '';
      }
    }
  }



  calDistance(org, dest){
    var service = new google.maps.DistanceMatrixService;

    service.getDistanceMatrix({
      origins: [org],
      destinations: [dest],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }, (res,st)=>{this.callbackDistance(res,st)});
  }


  callbackDistance(response, status) {
    if (status !== google.maps.DistanceMatrixStatus.OK) {
      this.seeTransInfo = false;
      alert('오류가 발생했습니다. @_@;');
      document.getElementById('orgName').innerHTML  = this.noRoute;
      document.getElementById('destName').innerHTML = this.tryOsakaNear;
      document.getElementById('distance').innerHTML = '';
      document.getElementById('duration').innerHTML = '';
    } else {
      if(response.rows[0].elements[0].status === 'ZERO_RESULTS'){
        this.seeTransInfo = false;
        document.getElementById('orgName').innerHTML  = this.noRoute;
        document.getElementById('destName').innerHTML = this.tryOsakaNear;
        document.getElementById('distance').innerHTML = '';
        document.getElementById('duration').innerHTML = '';
      }else{
        this.seeTransInfo = true;
        this.orgName  = response.originAddresses[0];
        //this.destName = response.destinationAddresses[0];
        this.distance = response.rows[0].elements[0].distance.text;
        this.duration = response.rows[0].elements[0].duration.text;

        document.getElementById('orgName').innerHTML  = this.dpet + this.orgName;
        document.getElementById('destName').innerHTML = this.dest + this.name;
        document.getElementById('distance').innerHTML = this.distance + ", ";
        document.getElementById('duration').innerHTML = this.byCar + this.duration;
      }
    }
  }


  gotoInfo(){
    let url = 'https://www.google.co.kr/maps/dir/'  + this.currLat + ',+' + this.currLng + '/' + this.mapLat + ',+' + this.mapLng;
    //  todo : 교통편 보기 임시좌표
    //let url = 'https://www.google.co.kr/maps/dir/'  + 34.609262 + ',+' + 135.552087 + '/' + this.mapLat + ',+' + this.mapLng;
    this.platform.ready().then(() => {
      const browser = this.iab.create(url);
      browser.close();
    });

    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('event', {page: "findPath", name: "gotoInfo", mapName: this.name})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }


  disableMap(){
  }


  enableMap(){
  }


  addConnectivityListeners(){
    var onOnline = () => {
      setTimeout(() => {
        if(typeof google == "undefined" || typeof google.maps == "undefined"){
          this.loadGoogleMaps();
        } else {
          if(!this.mapInitialised){
            this.initMapByPos();
          }
          this.enableMap();
        }
      }, 2000);
    };

    var onOffline = () => {
      this.disableMap();
    };

    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
  }

}
