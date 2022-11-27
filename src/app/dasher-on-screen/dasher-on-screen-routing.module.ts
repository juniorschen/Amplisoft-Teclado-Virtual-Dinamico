import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DasherOnScreenComponent } from './dasher-on-screen.component';

const routes: Routes = [
  {
    path: 'dasher-on-screen',
    component: DasherOnScreenComponent
  },
  {
    path: '**', redirectTo: 'dasher-on-screen'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DasherOnScreenRoutingModule { }
