import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: {username: string, password: string}) {
    return this.http.post('http://localhost:8090/api/auth/login', credentials);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  get currentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }
}
