import mongoose from "mongoose"; // Import Mongoose for MongoDB interaction
import validator from "validator"; // Import validator for email validation
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import jwt from "jsonwebtoken"; // Import jsonwebtoken for JWT handling

// Define the user schema with fields and validation rules
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your first name"], // Field is required with a custom error message
      maxLength: [25, "First name can not exceed 25 characters"], // Maximum length validation
      minLength: [3, "First name should have more than 3 characters"], // Minimum length validation
    },
    lastName: {
      type: String,
      required: [true, "Please enter your last name"], // Field is required with a custom error message
      maxLength: [25, "Last name can not exceed 25 characters"], // Maximum length validation
      minLength: [3, "Last name should have more than 3 characters"], // Minimum length validation
    },
    email: {
      type: String,
      required: [true, "Please enter your email"], // Field is required with a custom error message
      unique: [true, "Email already exists"], // Email must be unique with a custom error message
      validate: [validator.isEmail, "Please enter a valid email"], // Email validation using validator
    },
    password: {
      type: String,
      required: [true, "Please enter your password"], // Field is required with a custom error message
      minLength: [8, "Password must be at least 8 characters"], // Minimum length validation
      select: false, // Prevent password from being selected in queries by default
    },
    avatar: {
      public_id: String, // Cloudinary public ID for the avatar
      avatar_url: String, // URL for the avatar
    },
    dob: {
      type: Date, // Date of birth field
    },
    role: {
      type: String, // User role field
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Middleware to hash the password before saving
userSchema.pre("save", async function (next) {
  // Check if the password field has been modified
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10); // Generate salt for hashing
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    this.passwordUpdatedAt = Date.now(); // Update the password update timestamp
  }
  next(); // Move to the next middleware or save the document
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password); // Compare the given password with the stored hash
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET); // Generate a JWT token with the user's ID
};

// Create the User model from the schema
const User = new mongoose.model("User", userSchema);

export default User; // Export the User model for use in other parts of the application
