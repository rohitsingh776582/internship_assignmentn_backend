

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require("./routes/taskRoutes");


const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174"
];


// Middleware
app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());



app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Ensure DB connects before starting the server
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};



startServer();

