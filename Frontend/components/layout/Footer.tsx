import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-50">
      <div className="px-6 py-4 flex justify-between items-center text-sm text-gray-600">
        <div className="font-bold uppercase tracking-tight">Nava System</div>
        <div className="text-xs uppercase tracking-tight">
          &copy; {currentYear}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
