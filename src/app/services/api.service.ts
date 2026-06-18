import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { UserRole } from '../models/cyber.model';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private authToken = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authToken.next(localStorage.getItem('auth_token'));
  }

  private getHeaders(): HttpHeaders {
    const token = this.authToken.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Auth endpoints
  register(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/register`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data?.token) {
          this.authToken.next(response.data.token);
          localStorage.setItem('auth_token', response.data.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  login(email: string, password: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/login`, { email, password }, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.data?.token) {
          this.authToken.next(response.data.token);
          localStorage.setItem('auth_token', response.data.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/logout`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        this.authToken.next(null);
        localStorage.removeItem('auth_token');
      }),
      catchError(this.handleError)
    );
  }

  // Player endpoints
  getPlayerProfile(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/player/profile`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  updatePlayerProfile(data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/player/profile`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  searchPlayers(filters?: any): Observable<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.set(key, filters[key]);
      });
    }
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/player/search?${params.toString()}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Team endpoints
  getTeamProfile(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/team/profile`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateTeamProfile(data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/team/profile`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getTeams(filters?: any): Observable<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.set(key, filters[key]);
      });
    }
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/team/list?${params.toString()}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Offer endpoints
  sendOffer(offerData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/offers/send`, offerData, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getOffers(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/offers`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  respondToOffer(offerId: string, status: 'accepted' | 'rejected'): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/offers/${offerId}/respond`, { status }, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Generic CRUD methods
  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders(),
      params: params
    }).pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Xatolik yuz berdi';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Xatolik: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Serverga ulanib boʻlmadi. Backend ishga tushganligini tekshiring.';
      } else if (error.status === 401) {
        errorMessage = 'Tizimga kirish huquqi yoʻq. Qayta kiring.';
        this.authService.logout();
      } else if (error.status === 403) {
        errorMessage = 'Ruxsat berilmagan.';
      } else if (error.status === 404) {
        errorMessage = 'Maʼlumot topilmadi.';
      } else if (error.status === 500) {
        errorMessage = 'Server xatosi. Keyinroq urinib koʻring.';
      } else {
        errorMessage = error.error?.message || `Xatolik kodi: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}