# Frontend Quick Reference

## Project Structure

```
Frontend/
├── App.tsx                           # Main app with navbar + footer layout
├── index.tsx                         # Entry point
├── index.html                        # HTML template
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.js                # Tailwind CSS config
├── package.json                      # Dependencies
├── metadata.json                     # App metadata
├── README.md                         # Original readme
├── REFACTORING_GUIDE.md              # Comprehensive documentation
├── REFACTORING_SUMMARY.md            # What was completed
├── QUICK_REFERENCE.md                # This file
│
├── components/
│   ├── index.ts                      # Component exports
│   ├── Tabs.tsx                      # DEPRECATED - use Navbar
│   ├── StudentTab.tsx                # Student timetable
│   ├── InstructorTab.tsx             # Instructor timetable
│   │
│   ├── layout/
│   │   ├── Navbar.tsx                # Fixed top navbar
│   │   └── Footer.tsx                # Fixed bottom footer
│   │
│   └── camera/
│       ├── CameraTab.tsx             # Main camera component
│       ├── AddRoomForm.tsx           # Room creation form
│       ├── RoomTable.tsx             # Room list display
│       └── RoomDetails.tsx           # Historical data view
│
├── services/
│   ├── api.ts                        # API calls
│   └── timetableService.ts           # Timetable logic
│
├── types/
│   └── timetable.ts                  # TypeScript interfaces
│
└── data/
    └── timetable.json                # Sample data
```

## Common Tasks

### 1. Add a New Component

```tsx
// 1. Create file in appropriate folder
// components/feature/MyComponent.tsx

import React from "react";

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="bg-white border border-gray-300 p-6">
      <h2 className="text-xl font-bold border-b border-gray-300 pb-2">
        {title}
      </h2>
      <button
        onClick={onAction}
        className="mt-4 px-6 py-3 bg-gray-800 text-white font-bold uppercase hover:bg-black"
      >
        Action
      </button>
    </div>
  );
};

export default MyComponent;

// 2. Export from components/index.ts
export { default as MyComponent } from "./feature/MyComponent";

// 3. Use in other components
import { MyComponent } from "./components";
```

### 2. Call Backend API

```tsx
import { cameraApi } from "../services/api";

// In component
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string>("");

const fetchData = async () => {
  setLoading(true);
  setError("");
  try {
    const result = await cameraApi.getRooms();
    setData(result);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error");
  } finally {
    setLoading(false);
  }
};
```

### 3. Add New Type

```typescript
// types/timetable.ts

export interface MyType {
  id: string;
  name: string;
  createdAt: string;
}
```

### 4. Style a Component

```tsx
// Use Tailwind classes
<div className="bg-white border border-gray-300 p-6 space-y-4">
  <h2 className="text-xl font-bold border-b border-gray-300 pb-2">Heading</h2>

  <button className="px-6 py-3 bg-gray-800 text-white font-bold uppercase hover:bg-black disabled:bg-gray-400">
    Button
  </button>

  <table className="w-full border-collapse">
    <tr className="border-b border-gray-300 hover:bg-gray-50">
      <td className="p-3 border-r border-gray-300">Cell</td>
    </tr>
  </table>
</div>
```

## Styling Cheat Sheet

### Colors

```
Backgrounds: bg-white, bg-gray-100
Borders: border-gray-300
Text: text-gray-600, text-gray-800
Status: bg-green-100 text-green-700 (success)
Errors: bg-red-50 text-red-700
```

### Spacing

```
Padding: p-3, p-6, px-4, py-2
Margin: m-4, mt-2, mb-3
Gaps: gap-4, gap-6, space-y-4
```

### Common Patterns

```tsx
// Header with border
className = "text-xl font-bold border-b border-gray-300 pb-2";

// Button
className =
  "px-6 py-3 bg-gray-800 text-white font-bold uppercase hover:bg-black";

// Input
className =
  "border border-gray-300 p-3 bg-white outline-none focus:border-gray-800";

// Table cell
className = "p-3 border-r border-gray-300 text-sm";

// Status badge
className = "px-2 py-1 text-xs font-bold uppercase bg-green-100 text-green-700";
```

## API Methods

```typescript
// Camera API
cameraApi.createRoom(roomName, cameraIp)     // POST /api/camera/connect/
cameraApi.getRooms()                         // GET /api/camera/rooms/
cameraApi.getRoom(roomId)                    // GET /api/camera/rooms/{id}/
cameraApi.getRoomCounts(roomId)              // GET /api/camera/counts/?room_id=
cameraApi.connect(ip)                        // POST /api/camera/connect/ (legacy)
cameraApi.getCounts(roomId?)                 // GET /api/camera/counts/ (legacy)
```

## Component Props

### Navbar

```typescript
interface NavbarProps {
  activeTab: TabType; // 'student' | 'instructor' | 'camera'
  onTabChange: (tab: TabType) => void;
}
```

### AddRoomForm

```typescript
interface AddRoomFormProps {
  onSubmit: (roomName: string, cameraIp: string) => Promise<void>;
  isLoading?: boolean;
}
```

### RoomTable

```typescript
interface RoomTableProps {
  rooms: Room[];
  onSelectRoom: (roomId: string) => void;
  isLoading?: boolean;
}
```

### RoomDetails

```typescript
interface RoomDetailsProps {
  roomId: string;
  roomName: string;
  cameraIp: string;
}
```

## Type Definitions

```typescript
interface Room {
  id: string;
  room_name: string;
  camera_ip: string;
  status: "Active" | "Inactive";
  latest_people_count: number;
  last_updated: string;
}

interface CameraCount {
  id?: string;
  room_id?: string;
  timestamp: string;
  people_count: number;
}

interface Camera {
  id: string;
  ip_address: string;
  status: "Connected" | "Disconnected";
}

type TabType = "student" | "instructor" | "camera";
```

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check  # If configured

# Linting
npm run lint        # If configured
```

## Import Patterns

```typescript
// Component imports
import Navbar from "./components/layout/Navbar";
import { Navbar, Footer } from "./components";
import CameraTab from "./components/camera/CameraTab";

// Type imports
import type { Room, CameraCount } from "./types/timetable";
import { ConnectionStatus } from "./types/timetable";

// Service imports
import { cameraApi, request } from "./services/api";
```

## Common Errors & Fixes

| Error                   | Cause                           | Fix                               |
| ----------------------- | ------------------------------- | --------------------------------- |
| Component not rendering | Missing dependency in useEffect | Add to dependency array           |
| API calls not working   | Wrong endpoint URL              | Check BASE_URL in services/api.ts |
| Styling not applied     | Tailwind classes not in content | Check tailwind.config.js          |
| TypeScript errors       | Missing type definitions        | Check types/timetable.ts          |
| Layout broken           | Fixed navbar/footer overlap     | Check pt-20 pb-24 on main         |

## Links & References

- **Tailwind CSS**: https://tailwindcss.com/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Vite**: https://vitejs.dev

## Architecture Diagram

```
App.tsx
├── Navbar (fixed top)
│   └── TabType state
│
├── Main Content (flex-1)
│   └── Current Tab Component
│       ├── StudentTab
│       ├── InstructorTab
│       └── CameraTab
│           ├── AddRoomForm
│           ├── RoomTable
│           └── RoomDetails
│
└── Footer (fixed bottom)
```

## State Management Pattern

```tsx
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string>("");

const loadData = async () => {
  setLoading(true);
  setError("");
  try {
    const result = await apiCall();
    setData(result);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Error");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadData();
}, []);
```

## Form Pattern

```tsx
const [value, setValue] = useState("");
const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!value.trim()) {
    setError("Required field");
    return;
  }

  try {
    await api.call(value);
    setValue("");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Error");
  }
};
```

## Tips & Best Practices

✅ Always use TypeScript types
✅ Handle errors with try-catch
✅ Show loading states
✅ Validate input before sending
✅ Use semantic HTML
✅ Make components reusable
✅ Keep styles consistent
✅ Test on mobile
✅ Write clear comments
✅ Follow naming conventions

---

**Last Updated**: December 21, 2025
