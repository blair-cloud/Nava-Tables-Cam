import React from "react";
import { Room } from "../../types/timetable";

interface RoomTableProps {
  rooms: Room[];
  onSelectRoom: (roomId: string | number) => void;
  isLoading?: boolean;
}

const RoomTable: React.FC<RoomTableProps> = ({
  rooms,
  onSelectRoom,
  isLoading = false,
}) => {
  if (isLoading && rooms.length === 0) {
    return (
      <div className="bg-white border border-gray-300 p-10 text-center">
        <p className="text-gray-500 italic">Loading rooms...</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="bg-white border border-gray-300 p-10 text-center">
        <p className="text-gray-400 italic">
          No rooms created yet. Add a new room above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 overflow-hidden">
      <div className="p-3 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
        <h3 className="text-xs uppercase font-bold">Room List</h3>
        <span className="text-[10px] text-gray-500">
          {rooms.length} room(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-300 text-left sticky top-0">
              <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">
                Room Name
              </th>
              <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">
                Camera IP
              </th>
              <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">
                Status
              </th>
              <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">
                Latest Count
              </th>
              <th className="p-3 text-xs uppercase font-bold">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className="border-b border-gray-300 hover:bg-gray-50 cursor-pointer transition-none"
              >
                <td className="p-3 border-r border-gray-300 text-sm font-bold">
                  {room.name}
                </td>
                <td className="p-3 border-r border-gray-300 text-sm font-mono text-gray-600">
                  {room.camera_ip}
                </td>
                <td className="p-3 border-r border-gray-300 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-bold uppercase ${
                      room.status === "active"
                        ? "bg-green-100 text-green-700"
                        : room.status === "offline"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {room.status}
                  </span>
                </td>
                <td className="p-3 border-r border-gray-300 text-sm font-bold">
                  {room.latest_count}
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {room.last_updated
                    ? new Date(room.last_updated).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomTable;
