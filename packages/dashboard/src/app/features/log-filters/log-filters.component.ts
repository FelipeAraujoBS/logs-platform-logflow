import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogFilters, Severity } from '../../core/models/log.model';

@Component({
  selector: 'app-log-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-filters.component.html',
  styleUrls: ['./log-filters.component.css'],
})
export class LogFiltersComponent {
  @Output() filtersChanged = new EventEmitter<LogFilters>();

  severities: Severity[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

  filters: LogFilters = {
    severity: undefined,
    serviceName: undefined,
    startDate: undefined,
    endDate: undefined,
  };

  applyFilters(): void {
    this.filtersChanged.emit({ ...this.filters });
  }

  clearFilters(): void {
    this.filters = {};
    this.filtersChanged.emit({});
  }
}
