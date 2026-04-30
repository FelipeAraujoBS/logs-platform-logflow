import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LogService } from '../../core/services/log.service';
import { LogEntry, LogFilters, PaginatedResult } from '../../core/models/log.model';
import { LogTableComponent } from '../log-table/log-table.component';
import { LogFiltersComponent } from '../log-filters/log-filters.component';
import { ChartsComponent } from '../charts/charts.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LogTableComponent, LogFiltersComponent, ChartsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  result: PaginatedResult | null = null;
  loading = false;
  currentFilters: LogFilters = {};
  currentPage = 1;
  realtimeLogs: LogEntry[] = [];

  private wsSubscription: Subscription | null = null;

  constructor(
    private logService: LogService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadLogs();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.logService.disconnectWebSocket();
  }

  loadLogs(): void {
    this.loading = true;
    this.result = null;
    this.cdr.detectChanges();

    this.logService.getLogs(this.currentFilters, this.currentPage).subscribe({
      next: (result) => {
        this.result = { ...result, data: [...result.data] };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar logs:', error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onFiltersChanged(filters: LogFilters): void {
    this.currentFilters = filters;
    this.currentPage = 1;
    this.loadLogs();
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  private connectWebSocket(): void {
    this.wsSubscription = this.logService.connectWebSocket().subscribe({
      next: (log) => {
        this.realtimeLogs = [log, ...this.realtimeLogs].slice(0, 10);
        this.cdr.detectChanges();
      },
    });
  }
}
