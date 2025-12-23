import React, { useState, useEffect } from "react";
import { Room } from "../../types/timetable";
import { cameraApi } from "../../services/api";
import AddRoomForm from "./AddRoomForm";
import RoomTable from "./RoomTable";
import RoomDetails from "./RoomDetails";

/**
 * CameraTab Component
 * Manages room-based camera monitoring and people counting
 */

const CameraTab: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Load rooms on component mount
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await cameraApi.getRooms();
      setRooms(data || []);
      if (data && data.length > 0 && !selectedRoomId) {
        setSelectedRoomId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms");
      console.error("Error loading rooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRoom = async (roomName: string, cameraIp: string) => {
    try {
      const newRoom = await cameraApi.createRoom(roomName, cameraIp);
      setRooms((prev) => [newRoom, ...prev]);
      setSelectedRoomId(newRoom.id);
      setError("");
    } catch (err) {
      throw err;
    }
  };

  const handleSelectRoom = (roomId: string | number) => {
    setSelectedRoomId(roomId);
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-300 p-4 text-red-700 text-sm">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Add New Room Section */}
      <AddRoomForm onSubmit={handleAddRoom} isLoading={isLoading} />

      {/* Room List Section */}
      <RoomTable
        rooms={rooms}
        onSelectRoom={handleSelectRoom}
        isLoading={isLoading}
      />

      {/* Room Details Section */}
      {selectedRoom && (
        <RoomDetails
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          cameraIp={selectedRoom.camera_ip}
        />
      )}
    </div>
  );
};

export default CameraTab;
