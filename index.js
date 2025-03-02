require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoutes");
const artistRoutes = require("./routes/artistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const userDataRoutes = require("./routes/usersDataRoutes");
const newsRoutes = require("./routes/newsRoutes");
const festivalRoutes = require("./routes/festivalRoutes");
const pendingSubmissionRoutes = require("./routes/pendingSubmissionRoutes");
const PORT = process.env.PORT || 3500;

// Initializes Express App
const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://djdb.vercel.app",
      "https://electorinc.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("artists api");
});

// Routes
app.use("/api/user", userRoute, userDataRoutes);
app.use("/api/artists", ratingRoutes, artistRoutes, reviewRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/festivals", festivalRoutes);
app.use("/api/pending", pendingSubmissionRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log("Connected to MongoDB & app listening on port", PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
