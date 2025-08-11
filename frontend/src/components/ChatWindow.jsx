import React, { useEffect, useState, useRef, useCallback } from "react";
import * as api from "../api/api";
import MessageBubble from "./MessageBubble";
import { io } from "socket.io-client";

export default function ChatWindow({ wa_id, onBack, profile }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [contactInfo, setContactInfo] = useState({ name: wa_id, wa_id });
  
  const scrollRef = useRef();
  const socketRef = useRef();
  const inputRef = useRef();

  // Get current user's phone number
  const PROFILES = {
    'profile1': { phone: '919937320320', name: 'Ravi Kumar' },
    'profile2': { phone: '919876543210', name: 'Neha Joshi' },
  };
  
  const currentUserPhone = PROFILES[profile]?.phone;

  // Socket connection management
  useEffect(() => {
    if (!socketRef.current) {
      const socket = io(import.meta.env.VITE_API_BASE || "http://localhost:3000", {
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });
      
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected");
        setError(null);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setError("Real-time connection lost");
      });

      socket.on("message:new", (msg) => {
        // Check if this message is part of the current conversation
        const isRelevantMessage = (
          (msg.from === currentUserPhone && msg.to === wa_id) ||
          (msg.from === wa_id && msg.to === currentUserPhone)
        );

        if (isRelevantMessage) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === msg.id)) return prev;
            
            // Fix direction based on current user's perspective
            const correctedMsg = {
              ...msg,
              direction: msg.from === currentUserPhone ? "out" : "in"
            };
            
            return [...prev, correctedMsg];
          });
        }
      });

      socket.on("message:status", ({ id, status }) => {
        setMessages(prev => 
          prev.map(m => m.id === id ? { ...m, status } : m)
        );
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [wa_id]);

  // Load messages when wa_id changes
  useEffect(() => {
    if (wa_id) {
      loadMessages();
    }
  }, [wa_id]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getMessages(wa_id, profile);
      setMessages(data || []);
      
      // Extract contact info from first message
      if (data && data.length > 0) {
        const firstMsg = data[0];
        setContactInfo({
          name: firstMsg.name || wa_id,
          wa_id: wa_id
        });
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (e) => {
    e.preventDefault();
    
    const messageText = text.trim();
    if (!messageText || sending) return;

    setSending(true);
    setError(null);
    
    // Create optimistic message
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      wa_id,
      text: messageText,
      direction: "out",
      status: "sending",
      timestamp: new Date(),
      from: currentUserPhone,
      to: wa_id
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setText("");

    try {
      const payload = { wa_id, text: messageText, profile };
      const created = await api.sendMessage(wa_id, payload);
      
      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(m => m.id === tempId ? created : m)
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message");
      
      // Remove failed message
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setText(messageText); // Restore text
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatContactName = (name, wa_id) => {
    if (name && name !== wa_id) {
      return name;
    }
    // Format phone number nicely
    const cleanNumber = wa_id.replace(/\D/g, '');
    if (cleanNumber.length >= 10) {
      return `+${cleanNumber.slice(0, -10)} ${cleanNumber.slice(-10, -7)} ${cleanNumber.slice(-7, -4)} ${cleanNumber.slice(-4)}`;
    }
    return wa_id;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b bg-gray-50 p-4 flex items-center gap-3">
        <button 
          onClick={onBack} 
          className="md:hidden p-2 rounded-full hover:bg-gray-200 transition-colors"
          title="Back to conversations"
        >
          ←
        </button>
        
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
          {contactInfo.name?.[0]?.toUpperCase() || "U"}
        </div>
        
        <div className="flex-1">
          <div className="font-semibold text-gray-900">
            {formatContactName(contactInfo.name, contactInfo.wa_id)}
          </div>
          <div className="text-sm text-gray-500">
            {error ? "Connection issues" : "Online"}
          </div>
        </div>

        {error && (
          <button
            onClick={loadMessages}
            className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
            title="Retry loading messages"
          >
            🔄
          </button>
        )}
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef} 
        className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-2"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-red-500">❌ {error}</div>
            <button
              onClick={loadMessages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">No messages yet. Start the conversation!</div>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble 
              key={msg.id} 
              msg={msg} 
              currentUserPhone={currentUserPhone}
            />
          ))
        )}
      </div>

      {/* Error banner */}
      {error && messages.length > 0 && (
        <div className="bg-red-50 border-t border-red-200 p-2 text-center text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Type a message..."
              disabled={sending}
              maxLength={1000}
            />
            {text.length > 800 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {1000 - text.length}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            title="Send message"
          >
            {sending ? "⏳" : "➤"}
          </button>
        </div>
      </form>
    </div>
  );
}