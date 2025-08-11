import React from "react";

export default function MessageBubble({ msg, currentUserPhone }) {
  // Determine if message is outgoing based on sender and current user
  const isOutgoing = msg.direction === "out" || 
                     msg.from === currentUserPhone || 
                     msg.from === "me";
  
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sending":
        return "⏳";
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return <span className="text-blue-400">✓✓</span>;
      case "failed":
        return "❌";
      default:
        return "✓";
    }
  };

  const getMessageClass = () => {
    if (isOutgoing) {
      if (msg.status === "sending") {
        return "bg-green-400 text-white opacity-75";
      }
      if (msg.status === "failed") {
        return "bg-red-500 text-white";
      }
      return "bg-green-500 text-white";
    }
    return "bg-white text-gray-800 shadow-sm border border-gray-200";
  };

  // Handle long messages and line breaks
  const formatMessageText = (text) => {
    if (!text) return "";
    
    // Convert line breaks to JSX
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex mb-3 ${isOutgoing ? "justify-end" : "justify-start"}`}>
      <div 
        className={`max-w-[75%] sm:max-w-[60%] ${
          isOutgoing ? "order-2" : "order-1"
        }`}
      >
        <div
          className={`inline-block p-3 rounded-2xl ${getMessageClass()} ${
            isOutgoing 
              ? "rounded-br-md" 
              : "rounded-bl-md"
          }`}
          style={{
            wordWrap: 'break-word',
            wordBreak: 'break-word'
          }}
        >
          {/* Message text */}
          <div className="leading-relaxed">
            {formatMessageText(msg.text)}
          </div>
          
          {/* Message metadata */}
          <div className={`flex items-center justify-end gap-1 mt-1 text-[11px] ${
            isOutgoing ? "text-green-100" : "text-gray-500"
          }`}>
            <span>{formatTime(msg.timestamp)}</span>
            {isOutgoing && (
              <span className="ml-1 flex items-center">
                {getStatusIcon(msg.status)}
              </span>
            )}
          </div>
        </div>
        
        {/* Error message for failed sends */}
        {msg.status === "failed" && isOutgoing && (
          <div className="text-xs text-red-500 text-right mt-1 px-2">
            Failed to send. Tap to retry.
          </div>
        )}
      </div>
    </div>
  );
}