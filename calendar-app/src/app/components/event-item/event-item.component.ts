import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-item.component.html',
  styleUrl: './event-item.component.css'
})
export class EventItemComponent {
  @Input({ required: true }) event!: CalendarEvent;
  @Output() delete = new EventEmitter<string>();

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  onDelete(): void {
    if (confirm(`Delete "${this.event.title}"?`)) {
      this.delete.emit(this.event.id);
    }
  }
}
