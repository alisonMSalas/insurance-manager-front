import { Routes } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { MainComponent } from './core/components/main/main.component';
import { ListUsersComponent } from './users/components/list-users/list-users.component';
import { ListSegurosComponent } from './seguros/list-seguros/list-seguros.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ContratacionSegurosComponent } from './seguros/contratacion-seguros/contratacion-seguros.component';
import { ListClientsComponent } from './clientes/list-clients/list-clients.component';
import { ContratacionesListadoComponent } from './seguros/contratacion-listado/contrataciones-listado.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'insurance', pathMatch: 'full' },
            { path: 'users', component: ListUsersComponent },
            { path: 'insurance', component: ListSegurosComponent },
            { path: 'contratacion', component: ContratacionSegurosComponent },
            {path: 'clients',component: ListClientsComponent},
            { path: 'contrataciones', component: ContratacionesListadoComponent },
        ]
    },

    { path: '**', redirectTo: 'login' }
];