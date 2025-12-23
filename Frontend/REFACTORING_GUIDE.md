# Frontend Refactoring Documentation

## Overview

The frontend has been completely refactored to improve layout, usability, and maintainability while maintaining full backend API compatibility. The application now features a professional, clean UI with fixed navbar and footer, and room-based camera management.

## Architecture

### Component Structure

```
components/
├── layout/
│   ├── Navbar.tsx          # Fixed top navbar with logo, name, and tab navigation
│   └── Footer.tsx          # Fixed bottom footer
├── camera/
│   ├── CameraTab.tsx       # Main camera management component
│   ├── AddRoomForm.tsx     # Form to create new rooms with camera IPs
│   ├── RoomTable.tsx       # Table displaying all rooms
│   └── RoomDetails.tsx     # Detailed view of room with historical counts
├── StudentTab.tsx          # Student timetable view
├── InstructorTab.tsx       # Instructor timetable view
├── Tabs.tsx                # DEPRECATED - Use Navbar instead
└── index.ts                # Component exports
```

## Key Improvements

### 1. Global Layout

#### Navbar (Fixed Top)

- **Location**: `components/layout/Navbar.tsx`
- **Features**:
  - Fixed at top of viewport (z-index: 50)
  - Left side: Logo (NT) + App name
  - Right side: Tab navigation (Student | Instructor | Camera)
  - Active tab highlighted with dark background
  - No rounded corners, clean borders
  - Responsive design

#### Footer (Fixed Bottom)

- **Location**: `components/layout/Footer.tsx`
- **Features**:
  - Fixed at bottom of viewport (z-index: 50)
  - Shows app name and current year
  - Always visible regardless of content height
  - Professional, minimal design

#### Main Content Area

- Automatically adjusts for fixed navbar and footer
- Padding: `pt-20 pb-24` to accommodate fixed elements
- Max-width: 6xl with centered content
- Responsive padding: `px-4 py-6`

### 2. Camera Tab - Room-Based Management

**Location**: `components/camera/CameraTab.tsx`

#### Features

- **Add New Room Section**: Form to create rooms with camera IPs
- **Room List Table**: Displays all rooms with status and latest counts
- **Room Details**: Shows historical people count data for selected room

#### Components Used

**AddRoomForm** (`components/camera/AddRoomForm.tsx`)

- Form fields:
  - Room Name (text input)
  - Camera IP Address (text input with validation)
- Client-side validation:
  - Required field checks
  - IP format validation (###.###.###.###)
- Error handling with user-friendly messages
- Loading state during submission

**RoomTable** (`components/camera/RoomTable.tsx`)

- Displays all rooms in table format
- Columns:
  - Room Name
  - Camera IP
  - Status (Active/Inactive)
  - Latest People Count
  - Last Updated Timestamp
- Click row to view room details
- Responsive table with horizontal scroll on small screens
- Empty state messaging

**RoomDetails** (`components/camera/RoomDetails.tsx`)

- Shows room information header with IP
- Historical counts table with:
  - Timestamp
  - People Count
- Refresh button to reload data
- Loading and error states
- Max height with scrollable content

### 3. API Integration

**File**: `services/api.ts`

#### Available Endpoints

```typescript
// Room-based endpoints (new)
cameraApi.createRoom(roomName, cameraIp)
  → POST /api/camera/connect/
  → Returns: Room object

cameraApi.getRooms()
  → GET /api/camera/rooms/
  → Returns: Room[] array

cameraApi.getRoom(roomId)
  → GET /api/camera/rooms/{roomId}/
  → Returns: Single Room object

cameraApi.getRoomCounts(roomId)
  → GET /api/camera/counts/?room_id={roomId}
  → Returns: CameraCount[] array

// Legacy endpoints (backward compatible)
cameraApi.connect(ip)
cameraApi.getCounts(roomId?)
```

#### Request/Response Structure

**Room Interface**

```typescript
interface Room {
  id: string;
  room_name: string;
  camera_ip: string;
  status: "Active" | "Inactive";
  latest_people_count: number;
  last_updated: string;
}
```

**CameraCount Interface**

```typescript
interface CameraCount {
  id?: string;
  room_id?: string;
  timestamp: string;
  people_count: number;
}
```

## Styling Guidelines

### Tailwind CSS Classes Used

- **Colors**: `gray-100`, `gray-300`, `gray-400`, `gray-600`, `gray-700`, `gray-800`, `white`, `red-*`, `green-*`
- **Spacing**: `p-*`, `m-*`, `pt-*`, `pb-*`, `px-*`, `py-*`
- **Borders**: `border border-gray-300`, `border-b`, `border-r`, `border-t`
- **Responsive**: `md:flex-row`, `max-w-*`, `overflow-x-auto`

### Styling Rules (STRICT)

- ✅ Square borders (no rounded corners)
- ✅ No shadows
- ✅ No animations
- ✅ Neutral color palette
- ✅ Professional, clean aesthetic
- ✅ High contrast (dark text on light background)
- ✅ Clear visual hierarchy with borders and spacing

### Component-Level Styling Examples

**Buttons**

```tsx
// Primary action button
className =
  "px-6 py-3 bg-gray-800 text-white font-bold uppercase hover:bg-black disabled:bg-gray-400";

// Table row hover
className = "border-b border-gray-300 hover:bg-gray-50 cursor-pointer";
```

**Forms**

```tsx
// Input fields
className =
  "border border-gray-300 p-3 bg-white outline-none focus:border-gray-800";

// Labels
className = "text-xs font-bold mb-2 uppercase text-gray-700";
```

**Tables**

```tsx
// Header row
className = "bg-white border-b border-gray-300 text-left sticky top-0";

// Data cell
className = "p-3 border-r border-gray-300 text-sm";
```

## TypeScript Types

**File**: `types/timetable.ts`

All components use strict TypeScript with no `any` types. Key interfaces:

```typescript
// Room management
interface Room {
  id: string;
  room_name: string;
  camera_ip: string;
  status: "Active" | "Inactive";
  latest_people_count: number;
  last_updated: string;
}

// Historical counts
interface CameraCount {
  id?: string;
  room_id?: string;
  timestamp: string;
  people_count: number;
}

// Camera connection status
enum ConnectionStatus {
  DISCONNECTED = "Disconnected",
  CONNECTING = "Connecting",
  CONNECTED = "Connected",
  ERROR = "Error",
}
```

## Error Handling

All components implement defensive error handling:

1. **API Errors**

   - Caught and displayed to user
   - Clear error messages from backend
   - Fallback messages if no detail provided

2. **Validation Errors**

   - Client-side validation before submission
   - User-friendly error messages
   - Field highlighting (via styling)

3. **Loading States**

   - Loading indicators during API calls
   - Disabled form inputs while loading
   - Disabled buttons while processing

4. **Empty States**
   - Helpful messages when no data available
   - Encourages user action (e.g., "Add a new room")

## Usage Examples

### Adding a Room

```tsx
// User enters room name and camera IP
// Clicks "Add Room & Start Camera" button
// API call: POST /api/camera/connect/
// Response: New Room object
// UI: Room added to table, selected for viewing
```

### Viewing Room Details

```tsx
// User clicks on a room in the table
// RoomDetails component loads
// API call: GET /api/camera/counts/?room_id={roomId}
// Response: CameraCount[] array
// UI: Table of historical counts displayed
```

### Responsive Behavior

- **Desktop (md+)**: Full-width layout with side-by-side forms
- **Tablet/Mobile**: Stacked layout with full-width elements
- **Table Scrolling**: Horizontal scroll on small screens
- **Content Area**: Max-width with centered content for readability

## Development Notes

### Backend API Compatibility

- ✅ No changes required to backend
- ✅ API endpoints unchanged
- ✅ Request/response formats compatible
- ✅ Ready for token-based authentication

### Future Enhancements

- [ ] Real-time updates (WebSocket integration)
- [ ] Export room data to CSV
- [ ] Multi-select room deletion
- [ ] Camera status monitoring
- [ ] Advanced filtering and search
- [ ] Room templates

### Migration from Old Code

The old `CameraTab.tsx` file is kept for reference. To transition:

1. Update imports from `components/CameraTab` to `components/camera/CameraTab`
2. All functionality is preserved and enhanced
3. API calls use same endpoints (enhanced with room management)
4. No breaking changes to existing data structures

## File Checklist

✅ `App.tsx` - Updated layout with navbar/footer
✅ `components/layout/Navbar.tsx` - New navbar component
✅ `components/layout/Footer.tsx` - New footer component
✅ `components/camera/CameraTab.tsx` - Refactored main camera component
✅ `components/camera/AddRoomForm.tsx` - New form component
✅ `components/camera/RoomTable.tsx` - New table component
✅ `components/camera/RoomDetails.tsx` - New details component
✅ `services/api.ts` - Extended API service
✅ `types/timetable.ts` - Added new interfaces
✅ `components/Tabs.tsx` - Deprecated (kept for backward compat)
✅ `components/index.ts` - Component exports

## Testing Checklist

- [ ] Layout renders correctly on desktop, tablet, mobile
- [ ] Navbar tabs switch content properly
- [ ] Footer stays at bottom on short pages
- [ ] Form validation works
- [ ] Room creation calls correct API endpoint
- [ ] Room list displays data
- [ ] Room selection shows details
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] No console errors or warnings
- [ ] TypeScript compilation succeeds
- [ ] Tailwind classes render without issues

## Support & Questions

For questions about the refactored frontend structure, refer to this documentation or check individual component files for inline comments.
