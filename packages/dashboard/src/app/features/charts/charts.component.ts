import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { LogEntry, Severity } from '../../core/models/log.model';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
})
export class ChartsComponent implements OnChanges, AfterViewInit {
  @Input() logs: LogEntry[] = [];
  @ViewChild('severityChart') severityChartRef!: ElementRef;
  @ViewChild('volumeChart') volumeChartRef!: ElementRef;

  private severityChart: Chart | null = null;
  private volumeChart: Chart | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logs'] && this.viewReady) {
      this.renderCharts();
    }
  }

  private renderCharts(): void {
    this.renderSeverityChart();
    this.renderVolumeChart();
  }

  private renderSeverityChart(): void {
    const counts: Record<Severity, number> = {
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      FATAL: 0,
    };

    this.logs.forEach((log) => counts[log.severity]++);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [
          {
            data: Object.values(counts),
            backgroundColor: ['#4a4a6e', '#1a3a5e', '#3a2a0e', '#3a1a1a', '#5a0a0a'],
            borderColor: '#1e1e2e',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#a0a0b0', padding: 16 },
          },
        },
      },
    };

    if (this.severityChart) this.severityChart.destroy();
    this.severityChart = new Chart(this.severityChartRef.nativeElement, config);
  }

  private renderVolumeChart(): void {
    const volumeByHour: Record<string, number> = {};

    this.logs.forEach((log) => {
      const hour = new Date(log.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      volumeByHour[hour] = (volumeByHour[hour] ?? 0) + 1;
    });

    const labels = Object.keys(volumeByHour);
    const data = Object.values(volumeByHour);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Logs por horário',
            data,
            backgroundColor: '#6c63ff',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#a0a0b0' },
          },
        },
        scales: {
          x: { ticks: { color: '#a0a0b0' }, grid: { color: '#2a2a3e' } },
          y: { ticks: { color: '#a0a0b0' }, grid: { color: '#2a2a3e' } },
        },
      },
    };

    if (this.volumeChart) this.volumeChart.destroy();
    this.volumeChart = new Chart(this.volumeChartRef.nativeElement, config);
  }
}
