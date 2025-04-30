import { Routes } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { MainComponent } from './core/components/main/main.component';
import { ListUsersComponent } from './users/components/list-users/list-users.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    
    {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
    },
    {
        path: 'main',
        component: MainComponent,
        children: [
            {path:'users',component:ListUsersComponent}
        ]
    }
];
