import React, { useState } from "react";

interface AddRoomFormProps {
  onSubmit: (roomName: string, cameraIp: string) => Promise<void>;
  isLoading?: boolean;
}

const AddRoomForm: React.FC<AddRoomFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [roomName, setRoomName] = useState<string>("");
  const [cameraIp, setCameraIp] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!roomName.trim()) {
      setError("Room name is required");
      return;
    }

    if (!cameraIp.trim()) {
      setError("Camera IP address is required");
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(cameraIp.trim())) {
      setError("Invalid IP address format");
      return;
    }

    try {
      await onSubmit(roomName.trim(), cameraIp.trim());
      setRoomName("");
      setCameraIp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add room");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-300 p-6 space-y-4"
    >
      <h2 className="text-xl font-bold border-b border-gray-300 pb-2">
        Add New Room
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-300 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label
            htmlFor="room-name"
            className="text-xs font-bold mb-2 uppercase text-gray-700"
          >
            Room Name
          </label>
          <input
            id="room-name"
            type="text"
            placeholder="e.g., Lecture Hall A"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={isLoading}
            className="border border-gray-300 p-3 bg-white outline-none focus:border-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="camera-ip"
            className="text-xs font-bold mb-2 uppercase text-gray-700"
          >
            Camera IP Address
          </label>
          <input
            id="camera-ip"
            type="text"
            placeholder="e.g., 192.168.1.50"
            value={cameraIp}
            onChange={(e) => setCameraIp(e.target.value)}
            disabled={isLoading}
            className="border border-gray-300 p-3 bg-white outline-none focus:border-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-gray-800 text-white font-bold uppercase text-sm hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-none"
      >
        {isLoading ? "Adding Room..." : "Add Room & Start Camera"}
      </button>
    </form>
  );
};

export default AddRoomForm;
