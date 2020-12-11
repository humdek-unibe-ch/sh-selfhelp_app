import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabPage } from './tab.page';

const routes: Routes = [
  {
    path: '',
    component: TabPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabPageRoutingModule {}
