import React, { useState, useEffect } from "react";
import { CameraCount } from "../../types/timetable";
import { cameraApi } from "../../services/api";

interface RoomDetailsProps {
  roomId: string | number;
  roomName: string;
  cameraIp: string;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({
  roomId,
  roomName,
  cameraIp,
}) => {
  const [counts, setCounts] = useState<CameraCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadCounts();
  }, [roomId]);

  const loadCounts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await cameraApi.getRoomCounts(roomId);
      setCounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load counts");
      console.error("Error loading counts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 overflow-hidden">
      <div className="p-3 bg-gray-100 border-b border-gray-300">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs uppercase font-bold">{roomName}</h3>
            <p className="text-[10px] text-gray-600 mt-1">IP: {cameraIp}</p>
          </div>
          <button
            onClick={loadCounts}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-800 text-white text-xs font-bold uppercase hover:bg-black disabled:bg-gray-400 transition-none"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-300 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {isLoading && counts.length === 0 ? (
          <div className="p-10 text-center text-gray-500 italic">
            Loading historical counts...
          </div>
        ) : counts.length === 0 ? (
          <div className="p-10 text-center text-gray-400 italic">
            No count records available for this room.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-300 text-left sticky top-0">
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">
                  Timestamp
                </th>
                <th className="p-3 text-xs uppercase font-bold">
                  People Count
                </th>
              </tr>
            </thead>
            <tbody>
              {counts.map((count, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-300 hover:bg-gray-50"
                >
                  <td className="p-3 border-r border-gray-300 text-sm font-mono text-gray-600">
                    {new Date(count.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 text-sm font-bold">
                    {count.people_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RoomDetails;
