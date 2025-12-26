import { Component, computed, signal, HostListener } from '@angular/core';
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

  // Drag state
  isDragging = signal(false);
  dragType = signal<'move' | 'create' | null>(null);
  draggedEventId = signal<string | null>(null);
  dragColumnIndex = signal<number>(0);
  dragStartY = signal<number>(0);
  dragCurrentY = signal<number>(0);
  dragPreviewTop = signal<number>(0);
  dragPreviewHeight = signal<number>(0);
  private draggedEventDuration = 0;
  private hasDragged = false;

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

  // Drag and drop methods
  private snapToGrid(minutes: number): number {
    return Math.round(minutes / 15) * 15;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private getYFromElement(event: MouseEvent, container: HTMLElement): number {
    const rect = container.getBoundingClientRect();
    return event.clientY - rect.top + container.scrollTop;
  }

  onEventMouseDown(event: MouseEvent, eventId: string, dayIndex: number): void {
    event.preventDefault();
    event.stopPropagation();

    const calendarEvent = this.eventService.events().find(e => e.id === eventId);
    if (!calendarEvent) return;

    const startMin = this.timeToMinutes(calendarEvent.startTime);
    const endMin = this.timeToMinutes(calendarEvent.endTime);
    this.draggedEventDuration = endMin - startMin;

    this.isDragging.set(true);
    this.dragType.set('move');
    this.draggedEventId.set(eventId);
    this.dragColumnIndex.set(dayIndex);
    this.dragPreviewTop.set(this.minutesToPx(startMin));
    this.dragPreviewHeight.set(this.minutesToPx(this.draggedEventDuration));
  }

  onGridMouseDown(event: MouseEvent, dayIndex: number): void {
    const target = event.target as HTMLElement;
    if (target.closest('.positioned-event')) return;

    const container = target.closest('.day-column-body') as HTMLElement;
    if (!container) return;

    const y = this.getYFromElement(event, container);
    const snappedMinutes = this.snapToGrid(y);

    this.hasDragged = false;
    this.isDragging.set(true);
    this.dragType.set('create');
    this.dragColumnIndex.set(dayIndex);
    this.dragStartY.set(snappedMinutes);
    this.dragCurrentY.set(snappedMinutes);
    this.dragPreviewTop.set(snappedMinutes);
    this.dragPreviewHeight.set(0);
  }

  onGridMouseMove(event: MouseEvent, dayIndex: number): void {
    if (!this.isDragging()) return;

    const container = (event.target as HTMLElement).closest('.day-column-body') as HTMLElement;
    if (!container) return;

    const y = this.getYFromElement(event, container);
    const snappedY = this.snapToGrid(y);

    if (this.dragType() === 'create') {
      const startY = this.dragStartY();
      if (snappedY !== startY) {
        this.hasDragged = true;
      }
      const top = Math.min(startY, snappedY);
      const height = Math.abs(snappedY - startY);
      this.dragCurrentY.set(snappedY);
      this.dragPreviewTop.set(top);
      this.dragPreviewHeight.set(height);
      this.dragColumnIndex.set(dayIndex);
    } else if (this.dragType() === 'move') {
      const newTop = this.snapToGrid(snappedY - this.draggedEventDuration / 2);
      this.dragPreviewTop.set(Math.max(0, newTop));
      this.dragColumnIndex.set(dayIndex);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (!this.isDragging()) return;

    const dayIndex = this.dragColumnIndex();
    const dateString = this.weekDays()[dayIndex]?.dateString;
    if (!dateString) {
      this.resetDragState();
      return;
    }

    if (this.dragType() === 'create') {
      if (!this.hasDragged) {
        // Single click - open event form
        this.resetDragState();
        this.openEventForm(dateString);
        return;
      }

      const startY = Math.min(this.dragStartY(), this.dragCurrentY());
      const endY = Math.max(this.dragStartY(), this.dragCurrentY());
      const startTime = this.minutesToTime(startY);
      const endTime = this.minutesToTime(Math.max(endY, startY + 30));

      this.eventService.addEvent({
        title: 'New Event',
        date: dateString,
        startTime,
        endTime
      });
    } else if (this.dragType() === 'move') {
      const eventId = this.draggedEventId();
      if (eventId) {
        const newStartMinutes = this.snapToGrid(this.dragPreviewTop());
        const newEndMinutes = newStartMinutes + this.draggedEventDuration;
        const startTime = this.minutesToTime(newStartMinutes);
        const endTime = this.minutesToTime(newEndMinutes);

        this.eventService.updateEvent(eventId, {
          date: dateString,
          startTime,
          endTime
        });
      }
    }

    this.resetDragState();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isDragging()) {
      this.resetDragState();
    }
  }

  private resetDragState(): void {
    this.isDragging.set(false);
    this.dragType.set(null);
    this.draggedEventId.set(null);
    this.dragStartY.set(0);
    this.dragCurrentY.set(0);
    this.dragPreviewTop.set(0);
    this.dragPreviewHeight.set(0);
  }
}
