import { v2 as cloudinary } from "cloudinary"; // Import the Cloudinary library for image uploads
import cookieParser from "cookie-parser"; // Import the cookie-parser middleware
import cors from "cors"; // Import the CORS middleware
import "dotenv/config"; // Import the dotenv library to load environment variables from a .env file
import express from "express"; // Import the Express framework
import databaseConnection from "./database/dbConnect.js"; // Import the database connection module
import userRouter from "./routes/userRoutes.js"; // Import the user routes

const app = express(); // Create an instance of the Express application

// Configure Cloudinary for handling image uploads
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // Set the Cloudinary cloud name from environment variables
  api_key: process.env.API_KEY, // Set the Cloudinary API key from environment variables
  api_secret: process.env.API_SECRET, // Set the Cloudinary API secret from environment variables
});

// Connect to the database
databaseConnection();

// Middleware to parse JSON requests and handle large payloads
app.use(express.json({ limit: "100mb" }));

// Middleware to parse URL-encoded requests and handle large payloads
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Middleware to parse cookies
app.use(cookieParser());

// Middleware for Cross-Origin Resource Sharing (CORS) configuration
app.use(
  cors({
    // Allow requests from the specified frontend origin
    origin: [process.env.FRONTEND_URI],
    // Allow specified HTTP methods
    methods: ["GET", "POST", "PUT", "DELETE"],
    // Allow credentials to be included in requests
    credentials: true,
  })
);

// Route for user-related API endpoints
app.use("/api/v1/user", userRouter);

// Start the server and listen on the specified port
app.listen(process.env.PORT, () => {
  console.log(
    `Server is listening on PORT ${process.env.PORT} in ${process.env.NODE_ENV} Mode`
  );
});
