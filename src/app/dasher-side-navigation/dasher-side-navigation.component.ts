import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ConfigurationsService } from '../core/services/configuration.service';

@Component({
  selector: 'app-dasher-side-navigation',
  templateUrl: './dasher-side-navigation.component.html',
  styleUrls: ['./dasher-side-navigation.component.scss']
})
export class DasherSideNavigationComponent implements OnInit {

  @ViewChild('drawer') drawer: MatDrawer;
  public isEditing = false;

  constructor(private router: Router, private configurationsService: ConfigurationsService) {
  }

  ngOnInit() {
    this.router.navigate(['dasher-side-navigation/dasher-on-screen']);
  }

  onNavigate(route: string) {
    this.isEditing = false;
    this.router.navigate([route]);
    this.drawer.close();
  }

  edit() {
    this.isEditing = true;
    this.configurationsService.enablePageEdition.next(this.isEditing);
  }

  save() {
    this.isEditing = false;
    this.configurationsService.enablePageEdition.next(this.isEditing);
  }

}
