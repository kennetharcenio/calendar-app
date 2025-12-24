import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { EventFormComponent } from '../event-form/event-form.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CalendarEvent } from '../../models/event.model';

interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  column: number;
  totalColumns: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, EventFormComponent, ThemeToggleComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  private readonly HOUR_HEIGHT = 60;

  showEventForm = signal(false);
  selectedDate = signal<string | null>(null);
  currentWeekStart = signal(this.getWeekStart(new Date()));

  readonly hours = Array.from({ length: 24 }, (_, i) => i);

  weekDays = computed(() => {
    const days: { date: Date; dateString: string; dayName: string; isToday: boolean }[] = [];
    const start = this.currentWeekStart();

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateString = this.formatDate(date);
      days.push({
        date,
        dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: this.isToday(date)
      });
    }
    return days;
  });

  currentWeekLabel = computed(() => {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const year = start.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
  });

  constructor(public eventService: EventService) {}

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToPx(minutes: number): number {
    return (minutes / 60) * this.HOUR_HEIGHT;
  }

  formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  private eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
    const aStart = this.timeToMinutes(a.startTime);
    const aEnd = this.timeToMinutes(a.endTime);
    const bStart = this.timeToMinutes(b.startTime);
    const bEnd = this.timeToMinutes(b.endTime);
    return aStart < bEnd && bStart < aEnd;
  }

  getPositionedEventsForDate(dateString: string): PositionedEvent[] {
    const events = this.eventService.events().filter(e => e.date === dateString);

    if (events.length === 0) return [];

    const sorted = [...events].sort((a, b) => {
      const aStart = this.timeToMinutes(a.startTime);
      const bStart = this.timeToMinutes(b.startTime);
      if (aStart !== bStart) return aStart - bStart;

      const aDuration = this.timeToMinutes(a.endTime) - aStart;
      const bDuration = this.timeToMinutes(b.endTime) - bStart;
      return bDuration - aDuration;
    });

    const positioned: PositionedEvent[] = [];
    const columns: CalendarEvent[][] = [];

    for (const event of sorted) {
      const startMinutes = this.timeToMinutes(event.startTime);
      const endMinutes = this.timeToMinutes(event.endTime);
      const top = this.minutesToPx(startMinutes);
      const height = Math.max(this.minutesToPx(endMinutes - startMinutes), 20);

      let placedColumn = -1;
      for (let col = 0; col < columns.length; col++) {
        const canPlace = columns[col].every(e => !this.eventsOverlap(e, event));
        if (canPlace) {
          columns[col].push(event);
          placedColumn = col;
          break;
        }
      }

      if (placedColumn === -1) {
        columns.push([event]);
        placedColumn = columns.length - 1;
      }

      positioned.push({
        event,
        top,
        height,
        column: placedColumn,
        left: 0,
        width: 0,
        totalColumns: 0
      });
    }

    const totalColumns = columns.length;
    const columnWidth = 100 / totalColumns;

    for (const posEvent of positioned) {
      posEvent.totalColumns = totalColumns;
      posEvent.width = columnWidth - 1;
      posEvent.left = posEvent.column * columnWidth;
    }

    return positioned;
  }

  getEventsForDate(dateString: string): CalendarEvent[] {
    return this.eventService.events().filter(e => e.date === dateString);
  }

  previousWeek(): void {
    const current = this.currentWeekStart();
    const prev = new Date(current);
    prev.setDate(current.getDate() - 7);
    this.currentWeekStart.set(prev);
  }

  nextWeek(): void {
    const current = this.currentWeekStart();
    const next = new Date(current);
    next.setDate(current.getDate() + 7);
    this.currentWeekStart.set(next);
  }

  goToToday(): void {
    this.currentWeekStart.set(this.getWeekStart(new Date()));
  }

  openEventForm(dateString?: string): void {
    this.selectedDate.set(dateString || null);
    this.showEventForm.set(true);
  }

  closeEventForm(): void {
    this.showEventForm.set(false);
    this.selectedDate.set(null);
  }

  onEventSaved(): void {
    this.closeEventForm();
  }

  onDeleteEvent(id: string): void {
    this.eventService.deleteEvent(id);
  }
}
