import { Routes } from '@angular/router';
import { MainComponent } from './core/components/main/main.component';
import { ListUsersComponent } from './users/components/list-users/list-users.component';

export const routes: Routes = [
    {
        path: 'main',
        component: MainComponent,
        children: [
            {path:'users',component:ListUsersComponent}
        ]
            }
];
