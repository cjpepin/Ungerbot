import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './modules/about/about.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './modules//home/home/home.component';
import { LoginComponent } from './modules/login/login.component';
import { AuthGuard } from './shared/auth.guard';
import { YouveBeenKickedComponent } from './modules/youve-been-kicked/youve-been-kicked.component';
import { CreateAccountComponent } from './modules/login/create-account/create-account.component'
import { AccountComponent } from './modules/account/account.component';
import { BlankComponent } from './modules/blank/blank.component';
import { AdminComponent } from './modules/admin/admin.component';
import { FloorPlannerComponent } from './modules/floor-planner/floor-planner.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'uh-oh', component: YouveBeenKickedComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'blank', component: BlankComponent },
  { path: 'floor-planner', component: FloorPlannerComponent, canActivate: [AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
