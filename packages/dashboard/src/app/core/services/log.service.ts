import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { LogEntry, LogFilters, PaginatedResult } from '../models/log.model';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private readonly apiUrl = 'http://localhost:3001/api/v1';
  private newLog$ = new Subject<LogEntry>();
  private socket: WebSocket | null = null;

  constructor(private http: HttpClient) {}

  getLogs(
    filters: LogFilters = {},
    page: number = 1,
    pageSize: number = 50,
  ): Observable<PaginatedResult> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

    if (filters.severity) params = params.set('severity', filters.severity);
    if (filters.serviceName) params = params.set('serviceName', filters.serviceName);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.traceId) params = params.set('traceId', filters.traceId);

    return this.http.get<PaginatedResult>(`${this.apiUrl}/logs`, { params });
  }

  connectWebSocket(): Observable<LogEntry> {
    this.socket = new WebSocket('ws://localhost:3001/api/v1/logs/stream');

    this.socket.onmessage = (event) => {
      const log = JSON.parse(event.data) as LogEntry;
      this.newLog$.next(log);
    };

    this.socket.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket desconectado');
    };

    return this.newLog$.asObservable();
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
