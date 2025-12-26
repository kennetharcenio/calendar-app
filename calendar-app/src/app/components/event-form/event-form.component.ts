import { Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { CalendarEvent } from '../../models/event.model';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css'
})
export class EventFormComponent {
  @Input() preselectedDate: string | null = null;
  @Input() editEvent: CalendarEvent | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  title = signal('');
  date = signal('');
  startTime = signal('09:00');
  endTime = signal('10:00');

  isEditMode = false;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    if (this.editEvent) {
      this.isEditMode = true;
      this.title.set(this.editEvent.title);
      this.date.set(this.editEvent.date);
      this.startTime.set(this.editEvent.startTime);
      this.endTime.set(this.editEvent.endTime);
    } else if (this.preselectedDate) {
      this.date.set(this.preselectedDate);
    } else {
      this.date.set(new Date().toISOString().split('T')[0]);
    }
  }

  onSubmit(): void {
    if (!this.title() || !this.date() || !this.startTime() || !this.endTime()) {
      return;
    }

    if (this.isEditMode && this.editEvent) {
      this.eventService.updateEvent(this.editEvent.id, {
        title: this.title(),
        date: this.date(),
        startTime: this.startTime(),
        endTime: this.endTime()
      });
    } else {
      this.eventService.addEvent({
        title: this.title(),
        date: this.date(),
        startTime: this.startTime(),
        endTime: this.endTime()
      });
    }

    this.save.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cancel.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.cancel.emit();
  }
}
