# Calendar App

A modern, responsive weekly calendar application built with Angular 21.

## Features

- **Week View** - Display 7 days with 24-hour time slots
- **Drag & Drop Events** - Move events to reschedule by dragging
- **Drag to Create** - Click and drag on the grid to create new events
- **Click to Edit** - Click on any event to edit its details
- **Dark/Light Theme** - Toggle between themes with smooth transitions
- **Persistent Storage** - Events are saved to localStorage
- **Responsive Design** - Works on desktop and tablet screens

## Tech Stack

- **Angular 21** - Standalone components
- **Angular Signals** - Reactive state management
- **CSS Variables** - Dynamic theming
- **localStorage** - Data persistence

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Navigate to the app directory
cd calendar-app

# Install dependencies
npm install
```

### Development Server

```bash
ng serve
```

Open your browser and navigate to `http://localhost:4200/`. The app will automatically reload when you modify source files.

### Build

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory.

## Usage

| Action | How To |
|--------|--------|
| Create Event | Click on empty time slot, or drag to select time range |
| Edit Event | Click on an existing event |
| Move Event | Drag an event to a new time/day |
| Delete Event | Click the X button on an event |
| Navigate Weeks | Use Prev/Next buttons or Today button |
| Toggle Theme | Click the sun/moon icon |

## Project Structure

```
src/app/
├── components/
│   ├── calendar/           # Main calendar with week view
│   ├── event-form/         # Modal for create/edit events
│   └── theme-toggle/       # Theme switcher component
├── services/
│   └── event.service.ts    # Event CRUD operations
└── models/
    └── event.model.ts      # CalendarEvent interface
```

## Author

**Kenneth Audrey Arcenio**

## License

This project is for personal/educational use.
