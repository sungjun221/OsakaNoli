import {Component}   from '@angular/core';
import {HomePage}    from '../home/home';
import {FavPage}     from '../fav/fav';
import {MapPage}     from "../map/map";
import {BbsPage}     from "../bbs/bbs";
import {CafePage}     from "../cafe/cafe";
/*import {LoginPage}   from "../login/login";*/

@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {
  tab1Root: any  = HomePage;
  tab2Root: any  = MapPage;
  tab3Root: any  = FavPage;
  tab4Root: any  = BbsPage;
  tab5Root: any  = CafePage;
  /*tab6Root: any  = LoginPage;*/

  constructor() {
  }
}
