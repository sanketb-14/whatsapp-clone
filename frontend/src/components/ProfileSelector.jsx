import React, { useState, useEffect } from "react";
import Conversations from "./components/Conversations";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [profile, setProfile] = useState(() => localStorage.getItem("profile"));
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    if (profile) {
      localStorage.setItem("profile", profile);
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Select Your Profile</h2>
        <button
          onClick={() => setProfile("profile1")}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Ravi Kumar
        </button>
        <button
          onClick={() => setProfile("profile2")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Neha Joshi
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <div className="w-1/3 border-r">
        <Conversations setActiveChat={setActiveChat} />
      </div>
      <div className="flex-1">
        {activeChat ? (
          <ChatWindow
            wa_id={activeChat}
            profile={profile} // pass selected profile
            onBack={() => setActiveChat(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
