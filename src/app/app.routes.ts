import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { FormularioPagoComponent } from './formulario-pago/formulario-pago.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'pagos', component: FormularioPagoComponent },
    { path: 'formulario-pago', component: FormularioPagoComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/login' }
];