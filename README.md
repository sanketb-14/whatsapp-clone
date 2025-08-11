# WhatsApp Clone

A real-time messaging application built with React and Node.js that mimics WhatsApp's functionality.

## Features

- **Multi-User Support**: Switch between different user profiles
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Message Status**: Sent, delivered, and read indicators
- **Responsive Design**: Works on desktop and mobile devices
- **New Chat**: Start conversations with available users
- **Message History**: Persistent message storage in MongoDB

## Tech Stack

**Frontend:**
- React 19
- Socket.IO Client
- Tailwind CSS
- Axios

**Backend:**
- Node.js
- Express.js
- Socket.IO
- MongoDB with Mongoose
- dotenv

## Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd whatsapp-clone
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGODB_URI=your cluster mongodb_url
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_BASE=http://localhost:3000
```

## Running the Application

### 1. Start MongoDB
Make sure your MongoDB server is running.

### 2. Start Backend Server
```bash
cd backend
npm start
```
Server will run on `http://localhost:3000`

### 3. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## Usage

### 1. Select Profile
- Choose between **Ravi Kumar** or **Neha Joshi**
- Each profile represents a different user

### 2. Start Messaging
- Click "New Chat" to start a conversation
- Select a contact from the available users
- Send messages in real-time

### 3. Test Multi-User
- Open two browser windows/tabs
- Select different profiles in each window
- Send messages between profiles to see real-time updates

## Available Profiles

| Profile | Name | Phone Number |
|---------|------|--------------|
| profile1 | Ravi Kumar | 919937320320 |
| profile2 | Neha Joshi | 919876543210 |

## API Endpoints

### Messages
- `GET /api/conversations?profile=<profile>` - Get user's conversations
- `GET /api/conversations/:wa_id/messages?profile=<profile>` - Get messages for a conversation
- `POST /api/conversations/:wa_id/messages` - Send a new message

### Contacts
- `GET /api/contacts?profile=<profile>` - Get available contacts

### Webhook
- `POST /webhook` - Handle incoming messages (for external integrations)

## Project Structure

```
whatsapp-clone/
├── backend/
│   ├── controllers/
│   │   └── messagesController.js
│   ├── models/
│   │   └── Message.js
│   ├── routes/
│   │   └── webhook.js
│   ├── utils/
│   │   └── extractMessages.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.js
│   │   │   ├── MessageBubble.js
│   │   │   ├── Sidebar.js
│   │   │   └── NewChatModal.js
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Key Features Explained

### Real-time Updates
- Uses Socket.IO for instant message delivery
- Messages appear immediately without page refresh
- Status updates (sent → delivered → read) in real-time

### Message Direction
- Messages are displayed correctly for each user
- Outgoing messages appear on the right (green)
- Incoming messages appear on the left (white)

### Profile System
- Each user has a unique phone number
- Messages are properly routed between different users
- Conversations are isolated per profile

## Troubleshooting

### Common Issues

1. **Messages not appearing**
   - Check if backend server is running
   - Verify MongoDB connection
   - Check browser console for errors

2. **Real-time updates not working**
   - Ensure Socket.IO connection is established
   - Check network/firewall settings
   - Verify frontend and backend URLs match

3. **Database connection failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify database permissions

### Development Tips

- Use browser dev tools to monitor Socket.IO connections
- Check MongoDB collections for stored messages
- Use different browsers/incognito tabs to test multi-user functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please respect WhatsApp's trademarks and intellectual property.

## Support

For issues and questions, please create an issue in the repository or contact the development team.
