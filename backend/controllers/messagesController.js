import Message from "../models/Message.js";

// Profile to phone number mapping
const PROFILES = {
  'profile1': { phone: '919937320320', name: 'Ravi Kumar' },
  'profile2': { phone: '919876543210', name: 'Neha Joshi' },
};

export const getConversations = async (req, res) => {
  try {
    const { profile } = req.query;
    
    if (!profile || !PROFILES[profile]) {
      return res.status(400).json({ error: "Valid profile required" });
    }

    const currentUserPhone = PROFILES[profile].phone;
    
    // Get all conversations where current user is either sender or receiver
    // but exclude conversations with themselves
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { from: currentUserPhone },
            { to: currentUserPhone }
          ],
          // Exclude self-conversations
          $expr: { $ne: ["$from", "$to"] }
        }
      },
      {
        $addFields: {
          // Determine the other participant in the conversation
          otherParticipant: {
            $cond: {
              if: { $eq: ["$from", currentUserPhone] },
              then: "$to",
              else: "$from"
            }
          }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: "$otherParticipant",
          latestMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $ne: ["$from", currentUserPhone] },
                    { $ne: ["$status", "read"] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { "latestMessage.timestamp": -1 }
      }
    ]);

    const formattedConversations = conversations.map(conv => ({
      wa_id: conv._id,
      latestMessage: {
        ...conv.latestMessage,
        // Set correct direction based on current user's perspective
        direction: conv.latestMessage.from === currentUserPhone ? "out" : "in",
        // Ensure we show the correct participant's name
        name: conv.latestMessage.otherParticipant === currentUserPhone 
          ? conv.latestMessage.name 
          : getParticipantName(conv._id)
      },
      unreadCount: conv.unreadCount
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getMessagesForConversation = async (req, res) => {
  try {
    const { wa_id } = req.params;
    const { profile } = req.query;
    
    if (!profile || !PROFILES[profile]) {
      return res.status(400).json({ error: "Valid profile required" });
    }

    const currentUserPhone = PROFILES[profile].phone;
    
    // Get all messages between current user and the specified contact
    const messages = await Message.find({
      $or: [
        { from: currentUserPhone, to: wa_id },
        { from: wa_id, to: currentUserPhone }
      ]
    }).sort({ timestamp: 1 });

    // Fix the direction based on current user's perspective
    const correctedMessages = messages.map(msg => ({
      ...msg.toObject(),
      direction: msg.from === currentUserPhone ? "out" : "in"
    }));

    // Mark incoming messages as read
    await Message.updateMany(
      { 
        from: wa_id, 
        to: currentUserPhone, 
        status: { $ne: "read" } 
      },
      { status: "read" }
    );

    res.json(correctedMessages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const saveOutgoingMessage = async (req, res, io) => {
  try {
    const { wa_id } = req.params; // recipient's phone
    const { text, profile } = req.body;
    
    if (!profile || !PROFILES[profile]) {
      return res.status(400).json({ error: "Valid profile required" });
    }

    if (!text?.trim()) {
      return res.status(400).json({ error: "Message text required" });
    }

    const sender = PROFILES[profile];
    const recipient = getParticipantInfo(wa_id);
    
    // Prevent self-messaging
    if (sender.phone === wa_id) {
      return res.status(400).json({ error: "Cannot send message to yourself" });
    }

    const messageData = {
      wa_id: wa_id, // recipient's phone for conversation grouping
      name: recipient.name,
      number: wa_id,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      meta_msg_id: null,
      from: sender.phone,
      to: wa_id,
      text: text.trim(),
      media: null,
      timestamp: new Date(),
      status: "sent",
      direction: "out" // This will be corrected per user when fetching
    };

    const message = new Message(messageData);
    await message.save();

    // Emit raw message to all connected clients
    // Each client will determine direction based on their profile
    io.emit("message:new", message.toObject());
    
    // Simulate delivery status update after a short delay
    setTimeout(async () => {
      try {
        await Message.updateOne(
          { _id: message._id },
          { status: "delivered" }
        );
        io.emit("message:status", { 
          id: message.id, 
          status: "delivered" 
        });
      } catch (err) {
        console.error("Error updating message status:", err);
      }
    }, 1000);

    res.status(201).json(message);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Helper function to get participant name from phone number
function getParticipantName(phone) {
  const profile = Object.values(PROFILES).find(p => p.phone === phone);
  return profile ? profile.name : phone;
}

// Helper function to get participant info
function getParticipantInfo(phone) {
  const profile = Object.values(PROFILES).find(p => p.phone === phone);
  return profile ? { name: profile.name, phone } : { name: phone, phone };
}

// New endpoint to get available contacts (other users to chat with)
export const getAvailableContacts = async (req, res) => {
  try {
    const { profile } = req.query;
    
    if (!profile || !PROFILES[profile]) {
      return res.status(400).json({ error: "Valid profile required" });
    }

    const currentUserPhone = PROFILES[profile].phone;
    
    // Return all other profiles except current user
    const contacts = Object.entries(PROFILES)
      .filter(([key, data]) => data.phone !== currentUserPhone)
      .map(([key, data]) => ({
        wa_id: data.phone,
        name: data.name,
        profile: key
      }));

    res.json(contacts);
  } catch (error) {
    console.error("Error getting contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};