import mongoose from "mongoose";

/**
 * Establishes connection to the MongoDB database.
 */
const databaseConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "Quantumdb", // Specify the name of the database
    })
    .then(() => {
      console.log("Database Connection Established"); // Log success message when connection is established
    })
    .catch((err) => console.log(err)); // Log any errors that occur during connection attempt
};

export default databaseConnection;
