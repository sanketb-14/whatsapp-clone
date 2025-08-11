import React, { useState, useEffect } from "react";
import * as api from "../api/api";

export default function NewChatModal({ isOpen, onClose, onSelectContact, profile }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && profile) {
      loadContacts();
    }
  }, [isOpen, profile]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getAvailableContacts(profile);
      setContacts(data || []);
    } catch (err) {
      console.error("Failed to load contacts:", err);
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contact) => {
    onSelectContact(contact.wa_id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-96 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">New Chat</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-gray-500">Loading contacts...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">❌ {error}</div>
              <button
                onClick={loadContacts}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No contacts available</div>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.wa_id}
                  onClick={() => handleSelectContact(contact)}
                  className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                    {contact.name[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.wa_id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}