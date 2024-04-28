import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dasher-side-navigation',
  templateUrl: './dasher-side-navigation.component.html',
  styleUrls: ['./dasher-side-navigation.component.scss']
})
export class DasherSideNavigationComponent implements OnInit {

  @ViewChild('drawer') drawer: MatDrawer;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.router.navigate(['dasher-side-navigation/dasher-on-screen']);
  }

  onNavigate(route: string) {
    this.router.navigate([route]);
    this.drawer.close();
  }

}
