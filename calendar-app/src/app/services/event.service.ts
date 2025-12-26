import { Injectable, signal } from '@angular/core';
import { CalendarEvent } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly STORAGE_KEY = 'calendar_events';
  private eventsSignal = signal<CalendarEvent[]>(this.loadEvents());

  readonly events = this.eventsSignal.asReadonly();

  private loadEvents(): CalendarEvent[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveEvents(events: CalendarEvent[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
  }

  addEvent(event: Omit<CalendarEvent, 'id'>): void {
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID()
    };
    const updated = [...this.eventsSignal(), newEvent];
    this.eventsSignal.set(updated);
    this.saveEvents(updated);
  }

  deleteEvent(id: string): void {
    const updated = this.eventsSignal().filter(e => e.id !== id);
    this.eventsSignal.set(updated);
    this.saveEvents(updated);
  }

  updateEvent(id: string, updates: Partial<Omit<CalendarEvent, 'id'>>): void {
    const updated = this.eventsSignal().map(e =>
      e.id === id ? { ...e, ...updates } : e
    );
    this.eventsSignal.set(updated);
    this.saveEvents(updated);
  }

  getEventsForDate(date: string): CalendarEvent[] {
    return this.eventsSignal().filter(e => e.date === date);
  }
}
