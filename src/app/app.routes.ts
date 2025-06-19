import { Routes } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { MainComponent } from './core/components/main/main.component';
import { ListUsersComponent } from './users/components/list-users/list-users.component';
import { ListSegurosComponent } from './seguros/list-seguros/list-seguros.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ContratacionSegurosComponent } from './seguros/contratacion-seguros/contratacion-seguros.component';
import { ListClientsComponent } from './clientes/list-clients/list-clients.component';
import { ContratacionesListadoComponent } from './seguros/contratacion-listado/contrataciones-listado.component';
import { MainRevisionComponent } from './seguros/revision/main-revision/main-revision.component';
import { ResumenComponent } from './seguros/revision/resumen/resumen.component';
import { ReportesComponent } from './reportes/reportes.component';
import { ReembolsoListadoComponent } from './reembolsos/reembolso-listado';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'contrataciones', pathMatch: 'full' },
            { path: 'users', component: ListUsersComponent },
            { path: 'insurance', component: ListSegurosComponent },
            { path: 'contratacion', component: ContratacionSegurosComponent },
            {path: 'clients',component: ListClientsComponent},
            { path: 'contrataciones', component: ContratacionesListadoComponent },
            { path: 'main-revision', component:  MainRevisionComponent},
            { path: 'summary-revision', component:  ResumenComponent},
            { path: 'main-revision/:id', component: MainRevisionComponent },
            { path: 'reportes', component: ReportesComponent },
            {path: 'refunds', component: ReembolsoListadoComponent}


        ]
    },

    { path: '**', redirectTo: 'login' }
];