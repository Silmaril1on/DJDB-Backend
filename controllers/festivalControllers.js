const Festival = require("../models/festivalModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getFestivals = async (req, res) => {
  try {
    const festivals = await Festival.find({}).sort({ createdAt: -1 });
    res.status(200).json(festivals);
  } catch (error) {
    console.error("Error in get festivals:", error);
    res.status(500).json({ error: error.message });
  }
};

const getRandomFestivals = async (req, res) => {
  try {
    const festivals = await Festival.aggregate([
      { $sample: { size: 3 } },
      {
        $project: {
          name: 1,
          image: 1,
          flag: 1,
          _id: 1,
          country: 1,
        },
      },
    ]);
    res.status(200).json(festivals);
  } catch (error) {
    console.error("Error in random festival:", error);
    res.status(500).json({ error: error.message });
  }
};

const createFestival = async (req, res) => {
  try {
    const {
      name,
      desc,
      country,
      city,
      info,
      flag,
      image,
      link,
      dates,
      founders,
    } = req.body;

    const festivalPoster = await cloudinary.uploader.upload(image, {
      folder: "DJDB - Festival Posters",
    });

    const festival = await Festival.create({
      name,
      desc,
      country,
      city,
      info,
      flag,
      image: festivalPoster.secure_url,
      link,
      dates,
      founders,
    });
    res.status(201).json(festival);
  } catch (error) {
    console.error("Error in createFestival:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getRandomFestivals,
  getFestivals,
  createFestival,
};
