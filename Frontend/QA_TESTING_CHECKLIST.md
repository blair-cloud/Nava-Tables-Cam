# ✅ QA Testing Checklist

## Pre-Testing Setup

- [ ] Clone/pull latest frontend code
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open browser to http://localhost:5173 (or configured port)
- [ ] Open DevTools (F12) and check for errors
- [ ] Verify no TypeScript compilation errors

---

## Visual/Layout Testing

### Navbar Tests

- [ ] Navbar is fixed at top of page
- [ ] Navbar doesn't scroll with content
- [ ] Logo "NT" is visible on left
- [ ] App name "Nava Tables" is visible
- [ ] Three tabs are visible: Student, Instructor, Camera
- [ ] Active tab has dark background
- [ ] Inactive tabs have light background
- [ ] Tabs have no rounded corners
- [ ] Navbar has clean borders only
- [ ] Navbar is responsive on mobile

### Footer Tests

- [ ] Footer is fixed at bottom of page
- [ ] Footer doesn't scroll with content
- [ ] Footer shows app name
- [ ] Footer shows current year
- [ ] Footer text is visible
- [ ] Footer has clean borders only
- [ ] Footer is responsive on mobile

### Content Area Tests

- [ ] Content doesn't overlap navbar
- [ ] Content doesn't overlap footer
- [ ] Content has proper spacing
- [ ] Content max-width looks good on desktop
- [ ] Content is full-width on mobile
- [ ] Background color is light gray

### Responsive Tests

- [ ] Layout works at 320px width (mobile)
- [ ] Layout works at 768px width (tablet)
- [ ] Layout works at 1024px width (desktop)
- [ ] Layout works at 1440px width (large desktop)
- [ ] All elements are readable at all sizes
- [ ] No horizontal scrolling on mobile

---

## Tab Navigation Testing

### Student Tab

- [ ] Clicking "Student" shows Student tab content
- [ ] Student tab background is dark when active
- [ ] Previously viewed data is preserved
- [ ] No console errors on click

### Instructor Tab

- [ ] Clicking "Instructor" shows Instructor tab content
- [ ] Instructor tab background is dark when active
- [ ] Previously viewed data is preserved
- [ ] No console errors on click

### Camera Tab

- [ ] Clicking "Camera" shows Camera tab content
- [ ] Camera tab background is dark when active
- [ ] Camera components are visible
- [ ] No console errors on click

---

## Camera Tab - Add Room Form Tests

### Form Rendering

- [ ] Add Room Form is visible
- [ ] Form has title "Add New Room"
- [ ] Two input fields are visible
- [ ] Room Name label is visible
- [ ] Camera IP Address label is visible
- [ ] Button is labeled "Add Room & Start Camera"
- [ ] Form has no rounded corners
- [ ] Form has clean borders

### Input Validation

- [ ] Clicking submit with empty fields shows error
- [ ] Error message says "Room name is required" (or similar)
- [ ] Error message shows in red
- [ ] Entering room name only and submitting shows IP error
- [ ] Invalid IP format (e.g., "123") shows error
- [ ] Invalid IP format (e.g., "256.1.1.1") shows error
- [ ] Valid IP format (e.g., "192.168.1.50") is accepted
- [ ] Valid inputs: Room Name + valid IP = no validation error

### Form Interaction

- [ ] Typing in Room Name field works
- [ ] Typing in Camera IP field works
- [ ] Placeholder text is visible
- [ ] Focus state shows border change
- [ ] Tab order works correctly
- [ ] Enter key submits form
- [ ] Form can be cleared after submission
- [ ] Multiple rooms can be added sequentially

### Loading State

- [ ] Button shows loading state while submitting
- [ ] Button text changes during submission
- [ ] Inputs are disabled while loading
- [ ] Button is disabled while loading

---

## Camera Tab - Room Table Tests

### Table Rendering

- [ ] Table is visible
- [ ] Table title "Room List" is visible
- [ ] Room count is shown (e.g., "3 rooms")
- [ ] Table has proper borders
- [ ] No rounded corners on table
- [ ] Columns are: Room Name, Camera IP, Status, Latest Count, Last Updated

### Table Content (After Adding Rooms)

- [ ] Rooms appear in table
- [ ] Room names match what was entered
- [ ] Camera IPs match what was entered
- [ ] Status shows "Active" or "Inactive"
- [ ] People count is a number
- [ ] Timestamp is formatted (e.g., "2025-12-21 10:30")

### Table Interaction

- [ ] Hovering over row highlights it
- [ ] Clicking row changes selection
- [ ] Selected room details appear below
- [ ] Multiple rooms can be selected by clicking
- [ ] Table is scrollable horizontally on small screens
- [ ] Vertical scrolling works if many rooms

### Empty State

- [ ] If no rooms, table shows message
- [ ] Message says "No rooms created yet. Add a new room above to get started."
- [ ] Message is centered and readable

---

## Camera Tab - Room Details Tests

### Details Rendering (After Room Selection)

- [ ] Room Details section appears
- [ ] Room name is displayed
- [ ] Camera IP is displayed
- [ ] "Refresh" button is visible
- [ ] Table for historical data is visible
- [ ] Table has columns: Timestamp, People Count

### Historical Data Display

- [ ] Historical counts are listed
- [ ] Most recent count is at top
- [ ] Timestamps are formatted
- [ ] People counts are numbers
- [ ] Data is sorted by timestamp (newest first)

### Details Interaction

- [ ] Clicking refresh loads new data
- [ ] Refresh button shows loading state
- [ ] Refresh button is disabled while loading
- [ ] Details update after refresh
- [ ] Changing selected room updates details
- [ ] Table scrolls if many records

### Empty/Loading States

- [ ] Loading message shows while fetching
- [ ] Empty message shows if no historical data
- [ ] Error message shows if API fails
- [ ] Error message is readable and helpful

---

## API Integration Testing

### Network Requests

- [ ] Open DevTools → Network tab
- [ ] Adding room makes POST request to `/api/camera/connect/`
- [ ] Request has correct headers
- [ ] Request body has room_name and camera_ip
- [ ] Response shows room object (id, room_name, camera_ip, status, etc.)
- [ ] Rooms list makes GET request to `/api/camera/rooms/`
- [ ] Details makes GET request to `/api/camera/counts/?room_id=...`

### Error Handling

- [ ] Network error shows user-friendly message
- [ ] Invalid data shows appropriate error
- [ ] 400 errors display backend message
- [ ] 404 errors are handled
- [ ] 500 errors are handled
- [ ] Loading state clears on error
- [ ] Can retry after error

### Data Consistency

- [ ] Data in form matches submitted data
- [ ] Data in table matches returned data
- [ ] Multiple refreshes get same data
- [ ] Timestamps are consistent across views

---

## Styling Verification

### Colors Used

- [ ] Backgrounds: white or light gray
- [ ] Text: dark gray or black
- [ ] Borders: gray only
- [ ] Status Active: green background/text
- [ ] Status Inactive: gray background/text
- [ ] Errors: red background/text
- [ ] No other colors used

### Borders

- [ ] All borders are 1px solid
- [ ] No box shadows anywhere
- [ ] No rounded corners (border-radius: 0)
- [ ] Borders appear between sections
- [ ] Table cells have borders
- [ ] Buttons have no extra styling

### Spacing

- [ ] Consistent padding inside components
- [ ] Consistent margins between components
- [ ] Gap between form inputs
- [ ] Readable line height in tables
- [ ] No excessive whitespace
- [ ] Proper visual hierarchy

### Typography

- [ ] Headers are bold and uppercase
- [ ] Regular text is readable
- [ ] Small text (labels) is clear
- [ ] Font sizes are consistent
- [ ] Text alignment is proper

---

## Browser Compatibility

- [ ] Chrome/Chromium latest version
- [ ] Firefox latest version
- [ ] Safari latest version
- [ ] Edge latest version
- [ ] Mobile Safari (iOS)
- [ ] Chrome mobile (Android)

---

## Accessibility Testing

- [ ] Tab order works correctly
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Buttons are keyboard accessible
- [ ] Form inputs are keyboard accessible
- [ ] Focus states are visible
- [ ] Labels are associated with inputs
- [ ] Error messages are clear
- [ ] Color not only way to convey info

---

## Performance Testing

- [ ] Initial page load is fast
- [ ] Navbar doesn't lag on scroll
- [ ] Form submission doesn't freeze UI
- [ ] Table rendering is smooth
- [ ] Large lists don't slow page
- [ ] No console warnings
- [ ] No console errors
- [ ] Memory usage is reasonable

---

## Data Validation Testing

### Form Inputs

- [ ] Room name: spaces allowed
- [ ] Room name: special characters allowed
- [ ] Room name: numbers allowed
- [ ] Room name: very long names handled
- [ ] Camera IP: valid format required
- [ ] Camera IP: leading zeros handled
- [ ] Camera IP: IPv4 only required

### API Response Handling

- [ ] Missing fields handled gracefully
- [ ] Extra fields don't break UI
- [ ] Null values handled
- [ ] Empty arrays handled
- [ ] Malformed dates handled
- [ ] Unexpected data types handled

---

## State Management Testing

- [ ] State persists on tab switch
- [ ] State clears on page reload (if expected)
- [ ] Adding room updates table immediately
- [ ] Selecting room loads details immediately
- [ ] No state duplication
- [ ] No memory leaks
- [ ] Loading state managed correctly
- [ ] Error state managed correctly

---

## TypeScript/Code Quality

- [ ] No console errors
- [ ] No console warnings
- [ ] No TypeScript errors
- [ ] No unused variables
- [ ] No unused imports
- [ ] PropTypes/Interfaces used everywhere
- [ ] No `any` types
- [ ] Comments are helpful

---

## Documentation Verification

- [ ] REFACTORING_GUIDE.md is complete
- [ ] QUICK_REFERENCE.md has useful info
- [ ] BACKEND_API_SPEC.md has required endpoints
- [ ] COMPLETION_REPORT.md is accurate
- [ ] Code comments are clear
- [ ] Component props are documented

---

## Edge Cases

- [ ] Very long room names (50+ chars)
- [ ] Special characters in room names (✓, €, 中文)
- [ ] Rapid button clicks (no double submit)
- [ ] Adding room while refresh pending
- [ ] Switching rooms while loading
- [ ] Very slow network (check loading states)
- [ ] No internet (check error handling)
- [ ] Very large number of rooms (100+)
- [ ] Very large count numbers (999,999+)
- [ ] Timestamps in different timezones

---

## Final Checks

- [ ] All functionality works as designed
- [ ] No breaking changes from old code
- [ ] No console errors or warnings
- [ ] All pages responsive
- [ ] Professional appearance
- [ ] User can complete full workflow:
  1. Open app
  2. Navigate to Camera tab
  3. Add new room
  4. See room in list
  5. Click room
  6. View historical data
  7. Refresh data
  8. Switch tabs
  9. Return to Camera tab
  10. Data is still there

---

## Issues Found

| Issue     | Severity | Status | Notes                   |
| --------- | -------- | ------ | ----------------------- |
| (Example) | High     | Open   | Navbar overlaps content |
|           |          |        |                         |
|           |          |        |                         |
|           |          |        |                         |

---

## Sign-Off

- **QA Tester**: ********\_\_\_********
- **Date**: ********\_\_\_********
- **Result**: ☐ PASS ☐ FAIL ☐ NEEDS FIXES
- **Notes**: ****************\_\_\_****************

---

**Testing Date**: December 21, 2025
**Test Version**: Frontend v2.0 (Refactored)
**Backend Status**: Awaiting implementation
