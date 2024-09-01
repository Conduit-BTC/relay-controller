import React from "react";
import HomeBaseViz from "./HomeBaseViz";

const HomeBase: React.FC = () => {
  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 shadow-lg animate-gradient">
        <h1 className="text-4xl font-bold tracking-tight">
          Nostr Relay Controller
        </h1>
        <p className="text-lg mt-3 opacity-90">
          Visualize and manage your Nostr network
        </p>
      </header>
      <main className="flex-grow overflow-hidden p-6">
        <div className="bg-white bg-opacity-80 rounded-xl shadow-lg h-full backdrop-blur-sm border border-gray-200">
          <HomeBaseViz />
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4 px-6 text-center">
        <p className="text-sm">
          &copy; 2024 Nostr Relay Controller - Mozilla Public License 2.0 -
          <a
            href="https://github.com/amunrarara/relay-controller"
            className="ml-1 text-blue-300 hover:text-blue-100 transition-colors duration-200"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

export default HomeBase;
