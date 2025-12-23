
import { TimetableEntry, DayOfWeek } from '../types/timetable';

/**
 * ARCHITECTURE NOTE:
 * This service currently consumes local JSON. 
 * To switch to Django REST Framework:
 * 1. Import the `request` utility from `api.ts`.
 * 2. Update `fetchTimetable` to use `request<TimetableEntry[]>('/timetable/')`.
 */

export const timetableService = {
  /**
   * Fetches the complete list of timetable entries.
   * Flattens the nested JSON structure provided by the user.
   */
  async fetchTimetable(): Promise<TimetableEntry[]> {
    try {
      const response = await fetch('./data/timetable.json');
      if (!response.ok) {
        throw new Error('Failed to load local timetable data');
      }
      const rawData = await response.json();
      
      // Determine the root key (e.g., "Term_1_AY_2025/2026_Timetable")
      const rootKey = Object.keys(rawData)[0];
      const groups = rawData[rootKey];
      
      const flattened: TimetableEntry[] = [];
      
      for (const groupKey in groups) {
        const groupData = groups[groupKey];
        
        // Parsing "BAPM_2023_Section_A" into Cohort and Section
        const parts = groupKey.split('_');
        let cohort = "";
        let section = "";
        
        if (groupKey.includes('Section_')) {
          const sectionIndex = parts.indexOf('Section');
          cohort = parts.slice(0, sectionIndex).join(' ');
          section = parts[sectionIndex + 1];
        } else {
          cohort = groupKey.replace(/_/g, ' ');
          section = "N/A";
        }

        for (const day in groupData) {
          const daySessions = groupData[day];
          for (const sessionId in daySessions) {
            const session = daySessions[sessionId];
            flattened.push({
              cohort,
              section,
              instructor: session.Instructor,
              time_interval: session.Time,
              type: session.Type,
              session: day as DayOfWeek,
              course: session.Course,
              classroom: session.Classroom || "N/A"
            });
          }
        }
      }
      
      return flattened;
    } catch (error) {
      console.error('Timetable loading error:', error);
      return [];
    }
  },

  /**
   * Helper to extract unique values for filters
   */
  getUniqueValues(data: TimetableEntry[], key: keyof TimetableEntry): string[] {
    const values = data.map(item => String(item[key]));
    return Array.from(new Set(values)).sort();
  },

  /**
   * Sorts timetable data by day of week and then time.
   */
  sortTimetable(data: TimetableEntry[]): TimetableEntry[] {
    const dayOrder: Record<string, number> = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7
    };

    return [...data].sort((a, b) => {
      const dayDiff = (dayOrder[a.session] || 0) - (dayOrder[b.session] || 0);
      if (dayDiff !== 0) return dayDiff;
      return a.time_interval.localeCompare(b.time_interval);
    });
  }
};
