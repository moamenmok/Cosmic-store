import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guard/auth-guard';
import { loggedGuard } from './core/auth/guard/logged-guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Cosmic | Home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'shop',
    title: 'Cosmic | Shop',
    loadComponent: () => import('./features/shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'categories',
    title: 'Cosmic | Categories',
    loadComponent: () =>
      import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
  },

  {
    path: 'categories/:id',
    title: 'Cosmic | Category',
    loadComponent: () =>
      import('./features/categories/components/sub-categories/sub-categories.component').then(
        (m) => m.SubCategoriesComponent,
      ),
  },
  {
    path: 'brands',
    title: 'Cosmic | Brands',
    loadComponent: () =>
      import('./features/brands/brands.component').then((m) => m.BrandsComponent),
  },

  {
    path: 'brands/:id',
    title: 'Cosmic | Brand Details',
    loadComponent: () =>
      import('./features/brands/brand-details/brand-details.component').then(
        (m) => m.BrandDetailsComponent,
      ),
  },
  {
    path: 'product-details/:id',
    title: 'Cosmic | Product',
    loadComponent: () =>
      import('./features/product-details/product-details.component').then(
        (m) => m.ProductDetailsComponent,
      ),
  },
  {
    path: 'profile',
    title: 'Cosmic | Profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),

    children: [
      {
        path: '',
        redirectTo: 'my-profile',
        pathMatch: 'full',
      },
      {
        path: 'my-profile',
        title: 'Cosmic | My Profile',
        loadComponent: () =>
          import('./features/profile/components/my-profile/my-profile.component').then(
            (m) => m.MyProfileComponent,
          ),
      },
      {
        path: 'setting',
        title: 'Cosmic | Settings',
        loadComponent: () =>
          import('./features/profile/components/setting/setting.component').then(
            (m) => m.SettingComponent,
          ),
      },
    ],
  },
  {
    path: 'cart',
    title: 'Cosmic | Cart',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
  },

  {
    path: 'wishlist',
    title: 'Cosmic | Wishlist',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then((m) => m.WishlistComponent),
  },

  {
    path: 'checkout/:id',
    title: 'Cosmic | Checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },

  {
    path: 'allorders',
    title: 'Cosmic | My Orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: 'login',
    title: 'Cosmic | Sign In',
    canActivate: [loggedGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: 'register',
    title: 'Cosmic | Create Account',
    canActivate: [loggedGuard],
    loadComponent: () =>
      import('./features/register/register.component').then((m) => m.RegisterComponent),
  },

  {
    path: 'forget-pass',
    title: 'Cosmic | Forgot Password',
    canActivate: [loggedGuard],
    loadComponent: () =>
      import('./features/forget-pass/forget-pass.component').then((m) => m.ForgetPassComponent),
  },

  {
    path: 'change-pass',
    title: 'Cosmic | Change Password',
    canActivate: [loggedGuard],
    loadComponent: () =>
      import('./features/change-pass/change-pass.component').then((m) => m.ChangePassComponent),
  },
  {
    path: '**',
    title: 'Cosmic | Page Not Found',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
