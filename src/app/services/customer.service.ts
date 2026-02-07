import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Customer } from '../models/customer.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    console.log(token);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

/*
  getCustomers(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      tap(response => this.showMessage(response.message)),
      catchError(error => this.handleError(error))
    );
  }
*/

  getCustomer(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap(response => this.showMessage(response.message)),
      catchError(error => this.handleError(error))
    );
  }


  getCustomers(page: number = 1, pageSize: number = 5, filterString?: string, onlyMultipleAuthorities?: boolean, 
    sortColumn?: string, sortOrder?: boolean): Observable<any> {

      let url = `${this.apiUrl}?page=${page}&per_page=${pageSize}`;
    if (filterString) {
      url += `&filter_string=${encodeURIComponent(filterString)}`;
    }
    if (onlyMultipleAuthorities !== undefined && onlyMultipleAuthorities !== null) {
      url += `&only_multiple_authorities=${onlyMultipleAuthorities}`;
    }
    if (sortColumn) {
      url += `&sort_column=${encodeURIComponent(sortColumn)}`;
    }
    if (sortOrder !== undefined && sortOrder !== null) {
      url += `&sort_order=${sortOrder}`;
    }
    return this.http.get<any>(url, { headers: this.getAuthHeaders() }).pipe(
      tap(response => this.showMessage(response.message)),
      catchError(error => this.handleError(error))
    );
  }

  addCustomer(customer: Customer): Observable<any> {
    return this.http.post<any>(this.apiUrl, customer, { headers: this.getAuthHeaders() }).pipe(
      tap(response => this.showMessage(response.message)),
      catchError(error => this.handleError(error))
    );
  }

  updateCustomer(id: number, customer: Customer): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, customer, { headers: this.getAuthHeaders() }).pipe(
      tap(response => this.showMessage(response.message)),
      catchError(error => this.handleError(error))
    );
  }

  deleteCustomer(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/logout`, { headers: this.getAuthHeaders() }).pipe(
      tap(response => this.showMessage(response.message)),
      catchError(error => this.handleError(error))
    );
  }

  getFaculties(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/faculties`).pipe(
      catchError(this.handleError)
    );
  }

  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/departments`).pipe(
      catchError(this.handleError)
    );
  }

  downloadCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/csv`, { 
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private showMessage(message: string): void {
    console.log(message); // Handle success message here
  }

  private handleError(error: any): Observable<never> {
    const errorMessage = error?.message || 'An unexpected error occurred';
    console.error('API Error:', errorMessage);
    return throwError(() => errorMessage); // Pass the error message to the component
  }
}
