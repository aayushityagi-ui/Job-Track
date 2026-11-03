
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("JobTrack Backend is running!");
});
// Get all job applications
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await mongoose.connection
      .collection("application")
      .find({})
      .toArray();

    res.json(
      jobs.map((job) => ({
        ...job,
        id: job._id.toString(),
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: "Error fetching job applications",
      error: error.message,
    });
  }
});
// Get all job applications from MongoDB
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await mongoose.connection
      .collection("application")
      .find({})
      .sort({ _id: -1 })
      .toArray();

    const formattedJobs = jobs.map((job) => ({
      ...job,
      id: job._id.toString(),
    }));

    res.json(formattedJobs);
  } catch (error) {
    res.status(500).json({
      message: "Error loading job applications",
      error: error.message,
    });
  }
});
// Add a job application
app.post("/api/jobs", async (req, res) => {
  try {
    const job = req.body;

    const result = await mongoose.connection
      .collection("application")
      .insertOne(job);

    res.status(201).json({
      message: "Job application saved successfully!",
      jobId: result.insertedId.toString(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saving job application",
      error: error.message,
    });
  }
});

// Update a job application
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const updatedJob = {
      company: req.body.company,
      role: req.body.role,
      status: req.body.status,
      date: req.body.date,
    };

    const result = await mongoose.connection
      .collection("application")
      .updateOne(
        {
          _id: new mongoose.Types.ObjectId(jobId),
        },
        {
          $set: updatedJob,
        }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Job application not found",
      });
    }

    res.json({
      message: "Job application updated successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating job application",
      error: error.message,
    });
  }
});

// Delete a job application
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const result = await mongoose.connection
      .collection("application")
      .deleteOne({
        _id: new mongoose.Types.ObjectId(jobId),
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Job application not found",
      });
    }

    res.json({
      message: "Job application deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting job application",
      error: error.message,
    });
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });

// Start server
app.listen(PORT, () => {
  console.log(`JobTrack server is running on port ${PORT}`);
});
