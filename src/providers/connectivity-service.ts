import {Injectable}   from '@angular/core';
import {Network}      from '@ionic-native/network';
import {Subscription} from 'rxjs/Subscription';

declare var Connection;

@Injectable()
export class ConnectivityService {

  //onDevice: boolean;
  connected: Subscription;
  disconnected: Subscription;
  onlineFlg : boolean = false;

  constructor(private network: Network){
    //this.onDevice = this.platform.is('cordova');
  }

  startSubscribe() {
    console.log('[ConnectivityService:startSubscribe()]');
    this.connected = this.network.onConnect().subscribe(data => {
      console.log(data)
      this.displayNetworkUpdate(data.type);
    }, error => console.error(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      console.log(data)
      this.displayNetworkUpdate(data.type);
    }, error => console.error(error));
  }

  endSubscribe() {
    console.log('[ConnectivityService:endSubscribe()]');
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }

  displayNetworkUpdate(connectionState: string){
    console.log('[ConnectivityService:displayNetworkUpdate()]');

    let networkType = this.network.type;
    console.log('networkType', networkType);

    if(Connection.NONE == networkType){
      this.onlineFlg = false;
    }
    this.onlineFlg = true;
  }

  isOnline() : boolean{
    console.log('[ConnectivityService:isOnline()] onlineFlg', this.onlineFlg);
    //return this.onlineFlg;
    return true;
  }


  /*isOnline() {
    let connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');

      if(this.onDevice && this.network.onConnect()){
        return this.network.onConnect() !== Connection.NONE;
      } else {
        return navigator.onLine;
      }
    });

    // stop connect watch
    connectSubscription.unsubscribe();
    return false;
  }*/
}
