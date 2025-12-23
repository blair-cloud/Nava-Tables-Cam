
import React, { useState, useEffect } from 'react';
import { TimetableEntry } from '../types/timetable';
import { timetableService } from '../services/timetableService';

const StudentTab: React.FC = () => {
  const [allData, setAllData] = useState<TimetableEntry[]>([]);
  const [cohorts, setCohorts] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [filteredData, setFilteredData] = useState<TimetableEntry[]>([]);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await timetableService.fetchTimetable();
      setAllData(data);
      setCohorts(timetableService.getUniqueValues(data, 'cohort'));
      setSections(timetableService.getUniqueValues(data, 'section'));
    };
    load();
  }, []);

  const handleView = () => {
    if (!selectedCohort || !selectedSection) {
      alert("Please select both Cohort and Section.");
      return;
    }
    const filtered = allData.filter(
      item => item.cohort === selectedCohort && item.section === selectedSection
    );
    setFilteredData(timetableService.sortTimetable(filtered));
    setHasViewed(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 border border-gray-300 space-y-4">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 uppercase tracking-tight">Student Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold mb-1 uppercase text-gray-500">Cohort</label>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="border border-gray-300 p-2 bg-white outline-none focus:border-gray-800"
            >
              <option value="">Select Cohort</option>
              {cohorts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold mb-1 uppercase text-gray-500">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border border-gray-300 p-2 bg-white outline-none focus:border-gray-800"
            >
              <option value="">Select Section</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleView}
          className="bg-gray-800 text-white px-6 py-2 font-bold hover:bg-black transition-none uppercase text-sm"
        >
          View Timetable
        </button>
      </div>

      {hasViewed && (
        <div className="bg-white border border-gray-300 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-left">
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">Session</th>
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">Time</th>
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">Course</th>
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">Classroom</th>
                <th className="p-3 border-r border-gray-300 text-xs uppercase font-bold">Type</th>
                <th className="p-3 text-xs uppercase font-bold">Instructor</th>
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
                    <td className="p-3 border-r border-gray-300 text-sm">{item.type}</td>
                    <td className="p-3 text-sm">{item.instructor}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 italic">No classes found for the selected criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentTab;
