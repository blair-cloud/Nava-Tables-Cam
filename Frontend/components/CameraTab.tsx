import React, { useState, useEffect, useRef } from "react";
import { CameraLog, ConnectionStatus } from "../types/timetable";
import { cameraApi } from "../services/api";

const CameraTab: React.FC = () => {
  const [cameraIp, setCameraIp] = useState<string>("");
  const [status, setStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED
  );
  const [logs, setLogs] = useState<CameraLog[]>([]);
  const pollingRef = useRef<number | null>(null);

  const connectCamera = async () => {
    if (!cameraIp) {
      alert("Please enter a Camera IP.");
      return;
    }

    setStatus(ConnectionStatus.CONNECTING);

    try {
      /**
       * REAL API INTEGRATION:
       * await cameraApi.connect(cameraIp);
       */

      // Simulating network delay for connection
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus(ConnectionStatus.CONNECTED);

      // Start polling logic
      startPolling();
    } catch (error) {
      console.error("Camera connection failed:", error);
      setStatus(ConnectionStatus.ERROR);
    }
  };

  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    // Initial check
    fetchCounts();

    // Poll every 60 seconds as requested
    pollingRef.current = window.setInterval(() => {
      fetchCounts();
    }, 60000);
  };

  const fetchCounts = async () => {
    try {
      /**
       * REAL API INTEGRATION:
       * const data = await cameraApi.getCounts();
       * This would typically return a single new count record or a list.
       */

      // Simulating camera detection (placeholder logic)
      const newLog: CameraLog = {
        timestamp: new Date().toLocaleTimeString(),
        peopleCount: Math.floor(Math.random() * 50) + 1,
      };

      setLogs((prev) => [newLog, ...prev]);
    } catch (error) {
      console.error("Failed to fetch camera counts:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return "text-green-600";
      case ConnectionStatus.CONNECTING:
        return "text-blue-600";
      case ConnectionStatus.ERROR:
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 border border-gray-300 space-y-4">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-2">
          YOLO Integration
        </h2>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-col flex-1 max-w-sm">
            <label className="text-xs font-bold mb-1 uppercase text-gray-500">
              Camera IP Address
            </label>
            <input
              type="text"
              placeholder="e.g. 192.168.1.50"
              value={cameraIp}
              onChange={(e) => setCameraIp(e.target.value)}
              className="border border-gray-300 p-2 bg-white outline-none focus:border-gray-800"
              disabled={status === ConnectionStatus.CONNECTED}
            />
          </div>
          <button
            onClick={connectCamera}
            disabled={
              status === ConnectionStatus.CONNECTED ||
              status === ConnectionStatus.CONNECTING
            }
            className={`px-6 py-2 font-bold uppercase text-sm transition-none ${
              status === ConnectionStatus.CONNECTED
                ? "bg-green-600 text-white cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-black"
            }`}
          >
            {status === ConnectionStatus.CONNECTED
              ? "Connected"
              : "Connect Camera"}
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <span className="text-xs font-bold uppercase text-gray-500">
            Status:
          </span>
          <span className={`text-sm font-bold uppercase ${getStatusColor()}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="bg-white border border-gray-300">
        <div className="p-3 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-xs uppercase font-bold">
            Attendance Monitoring Log
          </h3>
          <span className="text-[10px] text-gray-500">Updates every 60s</span>
        </div>
        <div className="max-h-96 overflow-y-auto">
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
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-300 hover:bg-gray-50"
                  >
                    <td className="p-3 border-r border-gray-300 text-sm font-mono">
                      {log.timestamp}
                    </td>
                    <td className="p-3 text-sm font-bold">{log.peopleCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="p-10 text-center text-gray-400 italic"
                  >
                    No logs available. Connect camera to start monitoring.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CameraTab;
