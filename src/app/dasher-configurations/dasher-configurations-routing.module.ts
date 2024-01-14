import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DasherConfigurationsComponent } from './dasher-configurations.component';

const routes: Routes = [
  {
    path: 'dasher-control-settings',
    component: DasherConfigurationsComponent
  },
  {
    path: '**', redirectTo: 'dasher-control-settings'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DasherConfigurationsRoutingModule { }
