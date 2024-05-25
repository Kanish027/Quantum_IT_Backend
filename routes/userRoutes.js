import express from "express"; // Import the Express framework
import {
  getAllUsers,
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/userController.js"; // Import user-related controller functions
import isAuthenticated from "../middleware/auth.js"; // Import the authentication middleware

const router = express.Router(); // Create a new Express router

// Route to register a new user
router.post("/new", registerUser);

// Route to log in a user
router.post("/login", loginUser);

// Route to log out a user
router.get("/logout", logoutUser);

// Route to get the profile of the authenticated user
// This route uses the isAuthenticated middleware to ensure the user is logged in
router.get("/profile", isAuthenticated, getUserProfile);

// Route to get a list of all users
// This route also uses the isAuthenticated middleware to ensure the user is logged in
router.get("/users", isAuthenticated, getAllUsers);

export default router; // Export the router to be used in other parts of the application
