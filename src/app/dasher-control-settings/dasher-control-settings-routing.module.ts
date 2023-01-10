import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DasherControlSettingsComponent } from './dasher-control-settings.component';

const routes: Routes = [
  {
    path: 'dasher-control-settings',
    component: DasherControlSettingsComponent
  },
  {
    path: '**', redirectTo: 'dasher-control-settings'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DasherControlSettingsRoutingModule { }
