import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'npls/new',
        loadComponent: () =>
          import('./components/npls-form/npls-form.component').then(m => m.NplsFormComponent)
      },
      {
        path: 'npls/:id',
        loadComponent: () =>
          import('./components/npls-form/npls-form.component').then(m => m.NplsFormComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./components/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'cores',
        loadComponent: () =>
          import('./components/core-specs/core-specs.component').then(m => m.CoreSpecsComponent)
      },
      {
        path: 'reference',
        loadComponent: () =>
          import('./components/reference-data/reference-data.component').then(m => m.ReferenceDataComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
