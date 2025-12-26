# Calendar App

A weekly calendar application built with Angular 21.

## Tech Stack
- **Framework:** Angular 21 (standalone components)
- **State:** Angular Signals
- **Storage:** localStorage
- **Styling:** CSS with CSS Variables for theming

## Project Structure
```
calendar-app/src/app/
├── components/
│   ├── calendar/          # Main calendar component (week view)
│   ├── event-form/        # Modal form for creating/editing events
│   └── theme-toggle/      # Light/dark mode toggle
├── services/
│   └── event.service.ts   # Event CRUD operations with localStorage
└── models/
    └── event.model.ts     # CalendarEvent interface
```

## Key Features
- Week view with hourly time slots (24 hours)
- Drag and drop to move events
- Drag to create new events
- Click to edit existing events
- Light/dark theme support
- Events persist in localStorage

## Event Model
```typescript
interface CalendarEvent {
  id: string;        // UUID
  title: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm (24-hour)
  endTime: string;   // HH:mm (24-hour)
}
```

## CSS Variables
Theme colors are defined in `styles.css` using CSS variables:
- `--color-primary` - Primary accent color (indigo)
- `--color-bg-page` - Page background
- `--color-bg-card` - Card/container background
- `--color-text-primary` - Main text color
- `--color-border` - Border color

## Standard Workflow
1. First think through the problem, read the codebase for relevant files, and write a plan to todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.

## Author
Built by Kenneth Audrey Arcenio
