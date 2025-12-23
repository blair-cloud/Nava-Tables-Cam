import { Room, CameraCount } from "../types/timetable";

/**
 * Core API utility designed for seamless integration with Django REST Framework.
 * Replace BASE_URL with your actual backend endpoint.
 */

const BASE_URL = "/api"; // Placeholder for Django endpoint

interface RequestOptions extends RequestInit {
  token?: string;
}

export const request = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { token, ...rest } = options;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `API request failed: ${response.status}`
    );
  }

  return response.json();
};

export const cameraApi = {
  // Legacy endpoint - kept for backward compatibility
  connect: (ip: string) =>
    request<{ status: string }>("/camera/connect/", {
      method: "POST",
      body: JSON.stringify({ ip }),
    }),

  // Legacy endpoint - kept for backward compatibility
  getCounts: (roomId?: string) => {
    const endpoint = roomId
      ? `/camera/counts/?room_id=${roomId}`
      : "/camera/counts/";
    return request<CameraCount[]>(endpoint, {
      method: "GET",
    });
  },

  // Room-based camera management endpoints
  createRoom: (roomName: string, cameraIp: string) =>
    request<Room>("/rooms/", {
      method: "POST",
      body: JSON.stringify({
        name: roomName,
        camera_ip: cameraIp,
        is_active: true,
      }),
    }),

  getRooms: () =>
    request<Room[]>("/rooms/", {
      method: "GET",
    }),

  getRoom: (roomId: string | number) =>
    request<Room>(`/rooms/${roomId}/`, {
      method: "GET",
    }),

  getRoomCounts: (roomId: string | number) =>
    request<CameraCount[]>(`/rooms/${roomId}/counts/`, {
      method: "GET",
    }),

  stopRoom: (roomId: string | number) =>
    request<{ status: string }>(`/rooms/${roomId}/stop/`, {
      method: "POST",
    }),

  deleteRoom: (roomId: string | number) =>
    request<{ status: string }>(`/rooms/${roomId}/`, {
      method: "DELETE",
    }),

  updateRoom: (roomId: string | number, data: Partial<Room>) =>
    request<Room>(`/rooms/${roomId}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
