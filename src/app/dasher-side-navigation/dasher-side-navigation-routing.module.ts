import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DasherSideNavigationComponent } from './dasher-side-navigation.component';

const routes: Routes = [
  {
    path: 'dasher-side-navigation',
    component: DasherSideNavigationComponent,
    children: [
      {
        path: 'dasher-on-screen',
        loadChildren: () => import('../dasher-on-screen/dasher-on-screen.module').then((m) => m.DasherOnScreenModule),
      },
      {
        path: 'dasher-control-settings',
        loadChildren: () => import('../dasher-control-settings/dasher-control-settings.module').then((m) => m.DasherControlSettingsModule),
      },
      {
        path: 'dasher-feedback',
        loadChildren: () => import('../dasher-feedback/dasher-feedback.module').then((m) => m.DasherFeedbackModule),
      },
    ]
  },
  {
    path: '**', redirectTo: 'dasher-side-navigation'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DasherSideNavigationRoutingModule { }
