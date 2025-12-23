import React from "react";

/**
 * DEPRECATED: Use Navbar component from layout/Navbar.tsx instead
 * This component is kept for backward compatibility only
 */

export type TabType = "student" | "instructor" | "camera";

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: "student", label: " Student" },
    { id: "instructor", label: " Instructor" },
    { id: "camera", label: " Camera" },
  ];

  return (
    <div className="flex bg-white border-b border-gray-300">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-none rounded-none border-r border-gray-300 ${
            activeTab === tab.id
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800 hover:bg-gray-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
