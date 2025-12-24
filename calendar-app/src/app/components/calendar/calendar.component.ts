import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { EventFormComponent } from '../event-form/event-form.component';
import { EventItemComponent } from '../event-item/event-item.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CalendarEvent } from '../../models/event.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, EventFormComponent, EventItemComponent, ThemeToggleComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  showEventForm = signal(false);
  selectedDate = signal<string | null>(null);
  currentWeekStart = signal(this.getWeekStart(new Date()));

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
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    d.setDate(diff);
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
