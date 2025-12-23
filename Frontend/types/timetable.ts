export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface TimetableEntry {
  cohort: string;
  section: string;
  instructor: string;
  time_interval: string;
  type: string;
  session: DayOfWeek;
  course: string;
  classroom: string;
}

export interface CameraLog {
  timestamp: string;
  peopleCount: number;
}

export enum ConnectionStatus {
  DISCONNECTED = "Disconnected",
  CONNECTING = "Connecting",
  CONNECTED = "Connected",
  ERROR = "Error",
}

// Room-based camera management interfaces
export interface Room {
  id: string | number;
  name: string;
  camera_ip: string;
  is_active: boolean;
  status: "active" | "inactive" | "offline";
  latest_count: number;
  last_updated: string | null;
  created_at?: string;
}

export interface CameraCount {
  id?: string;
  room_id?: string;
  people_count: number;
  frames_processed?: number;
  inference_time_ms?: number;
  timestamp: string;
}

export interface Camera {
  id: string;
  ip_address: string;
  status: "Connected" | "Disconnected";
}
