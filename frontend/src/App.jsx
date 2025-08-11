import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import NewChatModal from "./components/NewChatModal";
import * as api from "./api/api";

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      return localStorage.getItem("profile");
    } catch (e) {
      console.warn("localStorage not available");
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const fetchConvs = useCallback(async () => {
    if (!profile) return;
    
    try {
      setError(null);
      const data = await api.getConversations(profile);
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError("Failed to load conversations");
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setLoading(true);
      fetchConvs().finally(() => setLoading(false));
      
      // Poll for updates every 5 seconds (reduced frequency)
      const interval = setInterval(fetchConvs, 5000);
      return () => clearInterval(interval);
    }
  }, [profile, fetchConvs]);

  function handleSelectProfile(p) {
    setProfile(p);
    setSelected(null); // Reset selection when switching profiles
    setConversations([]); // Clear conversations
    setError(null);
    
    try {
      localStorage.setItem("profile", p);
    } catch (e) {
      console.warn("Could not save to localStorage");
    }
  }

  function handleLogout() {
    setProfile(null);
    setSelected(null);
    setConversations([]);
    setError(null);
    
    try {
      localStorage.removeItem("profile");
    } catch (e) {
      console.warn("Could not clear localStorage");
    }
  }

  // Profile selection screen
  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Select Your Profile
          </h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleSelectProfile("profile1")}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              🧑‍💼 Ravi Kumar
            </button>
            <button
              onClick={() => handleSelectProfile("profile2")}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              👩‍💻 Neha Joshi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar
        conversations={conversations}
        onSelect={(id) => setSelected(id)}
        selectedWaId={selected}
        profile={profile}
        onLogout={handleLogout}
        loading={loading}
        error={error}
        onRetry={fetchConvs}
        onNewChat={() => setShowNewChat(true)}
      />
      
      {selected ? (
        <ChatWindow
          wa_id={selected}
          profile={profile}
          onBack={() => setSelected(null)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <div className="text-xl text-gray-600 mb-2">WhatsApp Web</div>
            <div className="text-gray-500 mb-4">Select a conversation to start messaging</div>
            <button
              onClick={() => setShowNewChat(true)}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Start New Chat
            </button>
          </div>
        </div>
      )}

      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onSelectContact={(contactId) => setSelected(contactId)}
        profile={profile}
      />
    </div>
  );
}