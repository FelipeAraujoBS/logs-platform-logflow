import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogEntry, PaginatedResult } from '../../core/models/log.model';

@Component({
  selector: 'app-log-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-table.component.html',
  styleUrls: ['./log-table.component.css'],
})
export class LogTableComponent {
  @Input() result: PaginatedResult | null = null;
  @Input() loading: boolean = false;
  @Output() pageChanged = new EventEmitter<number>();

  getSeverityClass(severity: string): string {
    return `severity-${severity.toLowerCase()}`;
  }

  goToPage(page: number): void {
    this.pageChanged.emit(page);
  }
}
