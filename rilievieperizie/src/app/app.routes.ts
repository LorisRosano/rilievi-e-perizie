import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { UtenteComponent } from './components/utente/utente.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'admin', component: AdminComponent }, 
    { path: 'login', component: LoginComponent }, 
    { path: 'utente', component: UtenteComponent }, 
];