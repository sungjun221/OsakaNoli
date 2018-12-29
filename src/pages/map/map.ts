import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, AlertController }   from 'ionic-angular';
import { Geolocation }                      from '@ionic-native/geolocation';
import { SqlSightService }                  from '../../providers/sql-sight-service';
import { ConnectivityService }              from '../../providers/connectivity-service';
import { GlobalVars }                       from '../../providers/global-vars';
import { SightDetailPage }                  from '../sight-detail/sight-detail';
import { TranslateService }                 from '@ngx-translate/core';
import { FirebaseAnalytics }                from '@ionic-native/firebase-analytics';


export class Marker{
  id        : string;
  name      : string;
  mapLat    : number;
  mapLng    : number;
  thumbPath : string;
  grpId     : string;

  constructor(id:string, name:string, mapLat:number, mapLng:number,
              thumbPath:string, grpId:string){
    this.id        = id;
    this.name      = name;
    this.mapLat    = mapLat;
    this.mapLng    = mapLng;
    this.thumbPath = thumbPath;
    this.grpId     = grpId;
  }
}


declare var google;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  @ViewChild('map') mapElement: ElementRef;

  map                     : any;
  mapInitialised          : boolean = false;
  markers                 : any = [];
  markerIcons             : any = [];
  isFirstLoadingComplete  : boolean = false;
  search                  : any;
  infowindow              : any;
  loadingBar              : boolean = true;

  pleaseEnterSight        : string = '';
  notFound                : string = '';
  confirm                 : string = '';
  minami                  : string = '';
  kita                    : string = '';
  osacaCastle             : string = '';
  tennoji                 : string = '';
  bayarea                 : string = '';

  constructor(private geolocation         : Geolocation,
              public navCtr               : NavController,
              public  globalVars          : GlobalVars,
              private connectivityService : ConnectivityService,
              private sqlSightService     : SqlSightService,
              private alertCtrl           : AlertController,
              private firebaseAnalytics: FirebaseAnalytics,
              private translate           : TranslateService) {
    console.log("[Map:()]");
    let cnt = 0;
    var loadingChk = setInterval(()=>{
      console.log("[Map:()] cnt : " + cnt);
      cnt++;
      console.log("[Map:()] this.sqlSightService.isLoadingComplete : " + this.sqlSightService.isLoadingComplete());

      translate.get([
        'MAP_PLEASE_ENTER_SIGHT',
        'MAP_NOT_FOUND',
        'MAP_CONFIRM',
        'MAP_MINAMI',
        'MAP_KITA',
        'MAP_OSACA_CASTLE',
        'MAP_TENNOJI',
        'MAP_BAYAREA']).subscribe(
        values => {
          this.pleaseEnterSight     = values.MAP_PLEASE_ENTER_SIGHT;
          this.notFound             = values.MAP_NOT_FOUND;
          this.confirm              = values.MAP_CONFIRM;
          this.minami               = values.MAP_MINAMI;
          this.kita                 = values.MAP_KITA;
          this.osacaCastle          = values.MAP_OSACA_CASTLE;
          this.tennoji              = values.MAP_TENNOJI;
          this.bayarea              = values.MAP_BAYAREA;
        });

      if(this.sqlSightService.isLoadingComplete()){
        clearInterval(loadingChk);
        this.readData().then(()=>{
          console.log("[Map:()] this.isFirstLoadingComplete = true");
          this.isFirstLoadingComplete = true;
        });
      }
      if(cnt > 50){
        clearInterval(loadingChk);
      }
    }, 200);
  }

  readData(){
    console.log("[Map:readData()]");
    return this.sqlSightService.getAllSights().then(
      data =>{
        if(data.rows.length > 0){
          for(var i = 0; i < data.rows.length; i++) {
            let item = data.rows.item(i);
            console.log("[Map:readData() getAllSights data] item.id:"+item.ID+",NAME:"+item.NAME+",GRP_ID:"+item.GRP_ID);
            this.markers.push(new Marker(item.ID, item.NAME, item.MAP_LAT, item.MAP_LNG, item.THUMB_PATH, item.GRP_ID));
          }
          this.loadGoogleMaps();
          this.loadingBar = false;
        }
      }).catch(error=>{
        console.error('[Map:readData()] getAllSights failed. : ' + error.message);
      });
  }


  ionViewDidEnter() {
    console.log("[Map:ionViewDidEnter()]");
    this.connectivityService.startSubscribe();
    if(this.isFirstLoadingComplete && this.globalVars.getHasGoOut() == true){
      this.readData();
      this.globalVars.setHasGoOut(false);
    }

    /*  firebase analystics */
    this.firebaseAnalytics.logEvent('page_view', {page: "map"})
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  ionViewWillLeave() {
    this.connectivityService.endSubscribe();
  }


  loadGoogleMaps(){
    console.log("[Map:loadGoogleMaps()]");
    this.addConnectivityListeners();

    console.log('   google', google);
    if(typeof google == "undefined" || typeof google.maps == "undefined"){
      this.disableMap();

      console.log('   this.connectivityService.isOnline()', this.connectivityService.isOnline());
      if(this.connectivityService.isOnline()){
        //Load the SDK
        window['mapInit'] = () => {
          this.initMap();
          this.enableMap();
        }
        /*let script = document.createElement("script");
        script.id = "googleMaps";

        if(this.apiKey){
          script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
        } else {
          script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
        }
        document.body.appendChild(script);*/
      }
    }
    else {
      console.log('   this.connectivityService.isOnline()', this.connectivityService.isOnline());
      if(this.connectivityService.isOnline()){
        this.initMap();
        this.enableMap();
      }
      else {
        this.disableMap();
      }
    }
  }

  initMap() {
    console.log("[Map:initMap()]");
    let mapOptions = {
      center: new google.maps.LatLng(34.671952, 135.501339),
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    // markers
    var latLng;
    var markerImgPath;
    this.infowindow = new google.maps.InfoWindow();

    for(var i=0; i<this.markers.length; i++) {
      var marker  = this.markers[i];
      latLng      = new google.maps.LatLng(marker.mapLat, marker.mapLng);

      // marker icon image
      switch(marker.grpId){
        case "MM":
          markerImgPath = 'assets/img/icon/red-dot.png';
          break;
        case "KT":
          markerImgPath = 'assets/img/icon/yellow-dot.png';
          break;
        case "OC":
          markerImgPath = 'assets/img/icon/green-dot.png';
          break;
        case "TJ":
          markerImgPath = 'assets/img/icon/purple-dot.png';
          break;
        case "BA":
          markerImgPath = 'assets/img/icon/blue-dot.png';
          break;
        default:
          markerImgPath = 'assets/img/icon/red-dot.png';
          break;
      }

      var markerIcon = this.createClickMarker({
        position  : latLng,
        html      : '<div id="iw-container">' +
                    '<div class="iw-title">'+marker.name+'</div>' +
                    '<div class="iw-content">' +
                    '<img src="'+marker.thumbPath+'">' +
                    '</div>' +
                    '</div>',
        map       : this.map,
        id        : marker.id,
        grpId     : marker.grpId,
        title     : marker.name,
        thumbPath : marker.thumbPath,
        icon      : markerImgPath,
      }, this.infowindow, this);

      this.markerIcons.push(markerIcon);
      google.maps.event.addListener(markerIcon, "html_changed", function(){
      });
    }

    google.maps.event.addListenerOnce(this.map, 'idle', function(){
      //this.enableMap();
    });

    // custom ui
    var centerControlDiv = document.createElement('div');
    this.centerControl(centerControlDiv, this.map);
    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerControlDiv);
    this.mapInitialised = true;
  }


  findMyPos(){
    console.log("[Map:findMyPos()]");
    this.geolocation.getCurrentPosition().then((position) => {
      console.log("[Map:findMyPos()] position : " + position.coords.latitude + ", " + position.coords.longitude);
      var myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      this.map.setCenter(myPos);

      var markerIcon = new google.maps.Marker({
        position  : myPos,
        map       : this.map,
        title     : '내 위치',
        thumbPath : 'assets/img/icon/pin.png',
        icon      : 'assets/img/icon/pin.png'
      });

      google.maps.event.addListener(markerIcon, "html_changed", function(){
      });
    });
  }


  findOsk(){
    console.log("[Map:findOsk()]");
    this.map.setCenter(new google.maps.LatLng(34.671952, 135.501339));
  }


  calculateAndDisplayRoute(directionsService, directionsDisplay, org, dest) {
    console.log("[Map:calculateAndDisplayRoute()]");
    directionsService.route({
      origin: org,
      destination:  dest,
      travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  centerControl(controlDiv, map) {
    console.log("[Map:centerControl()]");
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '14px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '12px';
    controlText.style.lineHeight = '26px';
    controlText.style.paddingLeft = '3px';
    controlText.style.paddingRight = '3px';
    controlText.innerHTML =   '<div class="foo red"></div>'         + this.minami
                            + '<br/><div class="foo yellow"></div>' + this.kita
                            + '<br/><div class="foo green"></div>'  + this.osacaCastle
                            + '<br/><div class="foo purple"></div>' + this.tennoji
                            + '<br/><div class="foo blue"></div>'   + this.bayarea
                            + '<br/>';
    controlUI.appendChild(controlText);
  }


  gotoDetail(id,grpId){
    console.log("[Map:gotoDetail()]");
    if(id!=="" && id !== undefined && id !== null){
      this.navCtr.push(SightDetailPage, {
        id        : id,
        grpId     : grpId
      });
    }
  }


  disableMap(){
    console.log("[Map:disableMap()]");
  }


  enableMap(){
    console.log("[Map:enableMap()]");
  }


  addConnectivityListeners(){
    console.log("[Map:addConnectivityListeners()]");
    var onOnline = () => {
      setTimeout(() => {
        if(typeof google == "undefined" || typeof google.maps == "undefined"){
          this.loadGoogleMaps();
        } else {
          if(!this.mapInitialised){
            this.initMap();
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


  createClickMarker(options, infowindow, self) {
    console.log("[Map:createClickMarker()]");
    var marker = new google.maps.Marker(options);

    var htmlBox = document.createElement("div");
    htmlBox.innerHTML = options.html || "";

    var container = document.createElement("div");
    container.appendChild(htmlBox);

    google.maps.event.addListener(marker, "click", function() {
      infowindow.setContent(container);
      infowindow.open(marker.getMap(), marker);
    });

    google.maps.event.addDomListener(container, "click", function() {
      self.navCtr.push(SightDetailPage, {
        id        : options.id,
        grpId     : options.grpId
      });
    });

    return marker;
  }


  searchSight() {
    console.log("[Map:searchSight()]");
    if(!this.search){
      this.customAlert(this.pleaseEnterSight);
      return;
    }
    var isFind = false;

    for(var i=0; i<this.markerIcons.length; i++) {
      var marker  = this.markerIcons[i];

      if(marker.title.indexOf(this.search) > -1){
        google.maps.event.trigger(marker, 'click');
        isFind = true;
      }
    }

    if(isFind == false){
      this.customAlert(this.notFound);
      this.search = "";
    }
  }

  customAlert(cont) {
    console.log("[Map:customAlert()]");
    let alert = this.alertCtrl.create({
      title: cont,
      buttons: [this.confirm]
    });
    alert.present();
  }
}


