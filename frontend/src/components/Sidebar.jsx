import React from "react";

export default function Sidebar({ 
  conversations, 
  onSelect, 
  selectedWaId, 
  profile, 
  onLogout, 
  loading, 
  error, 
  onRetry,
  onNewChat
}) {
  
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatContactName = (name, wa_id) => {
    if (name && name !== wa_id) {
      return name;
    }
    // Format phone number nicely
    const cleanNumber = wa_id?.replace(/\D/g, '') || '';
    if (cleanNumber.length >= 10) {
      return `+${cleanNumber.slice(0, -10)} ${cleanNumber.slice(-10, -7)} ${cleanNumber.slice(-7, -4)} ${cleanNumber.slice(-4)}`;
    }
    return wa_id || "Unknown";
  };

  const getProfileDisplayName = (profile) => {
    const profiles = {
      'profile1': 'Ravi Kumar',
      'profile2': 'Neha Joshi'
    };
    return profiles[profile] || profile;
  };

  const truncateMessage = (text, maxLength = 50) => {
    if (!text) return "No message";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="w-80 h-full border-r bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">WhatsApp</h1>
            <div className="text-sm text-gray-600">
              {getProfileDisplayName(profile)}
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
            title="Switch profile"
          >
            🚪
          </button>
        </div>
        
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          ✏️ New Chat
        </button>
      </div>

      {/* Search bar placeholder */}
      <div className="p-3 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-0 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500"
            readOnly
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            🔍
          </div>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-2">Loading conversations...</div>
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : error && conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-4">❌ {error}</div>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">💬</div>
            <div className="text-gray-500 mb-2">No conversations yet</div>
            <div className="text-sm text-gray-400">
              Start a conversation by sending a message
            </div>
          </div>
        ) : (
          <>
            {conversations.map((conv, index) => {
              const msg = conv.latestMessage || {};
              const isSelected = selectedWaId === conv.wa_id;
              const contactName = formatContactName(msg.name, conv.wa_id);
              
              return (
                <div
                  key={conv.wa_id || index}
                  onClick={() => onSelect(conv.wa_id)}
                  className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                    isSelected ? "bg-green-50 border-green-200" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {contactName[0]?.toUpperCase() || "U"}
                    </div>
                    
                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className={`font-medium truncate ${
                          isSelected ? "text-green-800" : "text-gray-900"
                        }`}>
                          {contactName}
                        </div>
                        <div className={`text-xs flex-shrink-0 ml-2 ${
                          isSelected ? "text-green-600" : "text-gray-500"
                        }`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {msg.direction === "out" && (
                          <span className={`text-xs ${
                            isSelected ? "text-green-600" : "text-gray-500"
                          }`}>
                            {msg.status === "delivered" ? "✓✓" : 
                             msg.status === "read" ? "✓✓" : 
                             msg.status === "sent" ? "✓" : "⏳"}
                          </span>
                        )}
                        <div className={`text-sm truncate ${
                          isSelected ? "text-green-700" : "text-gray-600"
                        }`}>
                          {truncateMessage(msg.text)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Loading indicator for refresh */}
            {loading && conversations.length > 0 && (
              <div className="p-3 text-center border-b border-gray-100">
                <div className="text-xs text-gray-500">Refreshing...</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {conversations.length > 0 && `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
        </div>
      </div>
    </div>
  );
}