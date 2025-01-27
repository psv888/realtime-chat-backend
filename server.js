const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
connectDB();

const app = express();

// Dynamically allow the frontend URL or any global access
const allowedOrigins = ['http://localhost:3000', 'http://192.168.0.106:3000', 'https://your-frontend.vercel.app'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
}));

app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);

// Root Route for Testing
app.get('/', (req, res) => {
    res.send('Backend is running successfully!');
});

// Create Server
const server = http.createServer(app);

// Set up Socket.IO with CORS configuration
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
    },
});

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle room joining
    socket.on('joinRoom', ({ sender, receiver }) => {
        const room = [sender, receiver].sort().join('-');
        socket.join(room);
        console.log(`${sender} joined room ${room}`);

        // Fetch and send previous messages
        Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender },
            ],
        })
            .sort({ timestamp: 1 })
            .then((messages) => {
                socket.emit('previousMessages', messages);
            });
    });

    // Handle incoming messages
    socket.on('privateMessage', async ({ sender, receiver, text }) => {
        const message = new Message({ sender, receiver, text });
        await message.save();

        const room = [sender, receiver].sort().join('-');
        io.to(room).emit('privateMessage', message);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Bind the server to a globally accessible address
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
