
import React, { useState, useEffect } from 'react';
import { TimetableEntry } from '../types/timetable';
import { timetableService } from '../services/timetableService';

const InstructorTab: React.FC = () => {
  const [allData, setAllData] = useState<TimetableEntry[]>([]);
  const [instructors, setInstructors] = useState<string[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [filteredData, setFilteredData] = useState<TimetableEntry[]>([]);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await timetableService.fetchTimetable();
      setAllData(data);
      setInstructors(timetableService.getUniqueValues(data, 'instructor'));
    };
    load();
  }, []);

  const handleView = () => {
    if (!selectedInstructor) {
      alert("Please select an instructor.");
      return;
    }
    const filtered = allData.filter(item => item.instructor === selectedInstructor);
    setFilteredData(timetableService.sortTimetable(filtered));
    setHasViewed(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 border border-gray-300 space-y-4">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 uppercase tracking-tight">Instructor Portal</h2>
        <div className="flex flex-col max-w-sm">
          <label className="text-xs font-bold mb-1 uppercase text-gray-500">Instructor Name</label>
          <select
            value={selectedInstructor}
            onChange={(e) => setSelectedInstructor(e.target.value)}
            className="border border-gray-300 p-2 bg-white outline-none focus:border-gray-800"
          >
            <option value="">Select Instructor</option>
            {instructors.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <button
          onClick={handleView}
          className="bg-gray-800 text-white px-6 py-2 font-bold hover:bg-black transition-none uppercase text-sm"
        >
          View Assignments
        </button>
      </div>

      {hasViewed && (
        <div className="bg-white border border-gray-300 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-left">
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">Day</th>
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">Time</th>
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">Course</th>
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">Classroom</th>
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">Cohort</th>
                <th className="p-3 text-xs uppercase font-bold">Section</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="p-3 border-r border-gray-300 text-sm font-bold">{item.session}</td>
                    <td className="p-3 border-r border-gray-300 text-sm whitespace-nowrap">{item.time_interval}</td>
                    <td className="p-3 border-r border-gray-300 text-sm">{item.course}</td>
                    <td className="p-3 border-r border-gray-300 text-sm">{item.classroom}</td>
                    <td className="p-3 border-r border-gray-300 text-sm">{item.cohort}</td>
                    <td className="p-3 text-sm">{item.section}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 italic">No assignments found for this instructor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InstructorTab;
