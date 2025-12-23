import React, { useState } from "react";
import Navbar, { TabType } from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import StudentTab from "./components/StudentTab";
import InstructorTab from "./components/InstructorTab";
import CameraTab from "./components/CameraTab";

/**
 * PRODUCTION-READY APP STRUCTURE
 * - Fixed navbar and footer
 * - Clean, professional layout
 * - Classic styling with no rounded corners
 * - Room-based camera management
 */

function App(): any {
  const [activeTab, setActiveTab] = useState<TabType>("student");

  const renderContent = () => {
    switch (activeTab) {
      case "student":
        return <StudentTab />;
      case "instructor":
        return <InstructorTab />;
      case "camera":
        return <CameraTab />;
      default:
        return <StudentTab />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Fixed Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area - with padding for navbar and footer */}
      <main className="flex-1 pt-20 pb-24 px-4 py-6">
        <div className="max-w-6xl mx-auto">{renderContent()}</div>
      </main>

      {/* Fixed Footer */}
      <Footer />
    </div>
  );
}

export default App;
