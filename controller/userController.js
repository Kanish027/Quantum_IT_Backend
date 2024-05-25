import User from "../model/userSchema.js";
import { v2 as cloudinary } from "cloudinary";

const registerUser = async (req, res) => {
  const { firstName, lastName, dob, avatar, email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }

    if (avatar) {
      const myCloud = await cloudinary.uploader.upload(avatar, {
        folder: "quantum_IT_task",
      });

      // Create a new user with the uploaded avatar
      const newUser = new User({
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        email: email,
        password: password,
        avatar: {
          public_id: myCloud.public_id,
          avatar_url: myCloud.secure_url,
        },
      });

      // Save the user to the database
      const user = await newUser.save();
      const token = await newUser.generateAuthToken();

      // Prepare user data to be sent in the response
      const result = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        email: user.email,
        role: user.role,
        dob: user.dob,
        createdAt: user.createdAt,
      };

      // Send the response with a cookie containing the authentication token
      res
        .status(200)
        .cookie("token", token, {
          expires: new Date(Date.now() + 3600000),
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
          secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
        })
        .json({
          success: true,
          message: "User Registered successfully",
          result,
        });
    } else {
      // If the user doesn't have an avatar, create a new user without it
      const newUser = new User({
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        email: email,
        password: password,
      });

      // Save the user to the database
      const user = await newUser.save();

      // Prepare user data to be sent in the response
      const result = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        email: user.email,
        role: user.role,
        dob: user.dob,
        createdAt: user.createdAt,
      };

      // Generate authentication token for the user
      const token = await newUser.generateAuthToken();
      // Send the response with a cookie containing the authentication token
      res
        .status(201)
        .cookie("token", token, {
          expires: new Date(Date.now() + 3600000),
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
          secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
        })
        .json({
          success: true,
          message: "User Registered successfully",
          result,
        });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email }).select("+password");
    // If user is not found, return an error response
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Registered",
      });
    }

    // Check if the provided password matches the stored password hash
    const isPasswordMatch = await user.matchPassword(password);

    // If passwords don't match, return an error response
    if (!isPasswordMatch) {
      return res.status(404).json({
        success: false,
        message: "Password does not match",
      });
    }

    // Generate authentication token for the user
    const token = await user.generateAuthToken();

    // Prepare user data to be sent in the response
    const userWithOutPassword = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      email: user.email,
      role: user.role,
      dob: user.dob,
      createdAt: user.createdAt,
    };

    // Send the response with a cookie containing the authentication token
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
        secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
      })
      .json({
        success: true,
        message: "User Logged in successfully",
        user: userWithOutPassword,
      });
  } catch (error) {
    // Handle any errors and send an appropriate response
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout user
const logoutUser = (req, res) => {
  // Clear the authentication token cookie
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
      secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

// User Profile Function
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Function to get all registered users
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Prepare user data to be sent in the response (excluding password)
    const usersList = users.map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      email: user.email,
      role: user.role,
      dob: user.dob,
      createdAt: user.createdAt,
    }));

    // Send the response with the list of users
    res.status(200).json({
      success: true,
      users: usersList,
    });
  } catch (error) {
    // Handle any errors and send an appropriate response
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export the function
export { registerUser, loginUser, logoutUser, getUserProfile, getAllUsers };
