import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DasherFeedbackComponent } from './dasher-feedback.component';

const routes: Routes = [
  {
    path: 'dasher-feedback',
    component: DasherFeedbackComponent
  },
  {
    path: '**', redirectTo: 'dasher-feedback'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DasherFeedbackRoutingModule { }
