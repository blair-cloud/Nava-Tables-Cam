import React from "react";

export type TabType = "student" | "instructor" | "camera";

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: "student", label: "Student" },
    { id: "instructor", label: "Instructor" },
    { id: "camera", label: "Camera" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-300 z-50">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left side: Logo and App Name */}
        <div className="flex items-center gap-3">
          
          <span className="text-lg font-bold uppercase tracking-tight">
            Nava Tables & Cam
          </span>
        </div>

        {/* Right side: Tabs */}
        <div className="flex">
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={`px-6 py-2 text-sm font-bold uppercase tracking-wide transition-none border-none ${
                  activeTab === tab.id
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-800 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
              {index < tabs.length - 1 && (
                <div className="w-px bg-gray-300"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
