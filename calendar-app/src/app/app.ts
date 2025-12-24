import { Component } from '@angular/core';
import { CalendarComponent } from './components/calendar/calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
