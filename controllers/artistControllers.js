const Artist = require("../models/artistsModel");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all artists
const getArtists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const artists = await Artist.find({})
      .select("name image _id stageName country flag ratingStats sex")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalArtists = await Artist.countDocuments();
    const totalPages = Math.ceil(totalArtists / limit);
    res.status(200).json({
      artists,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error in getArtists:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET Random artists
const getRandomArtists = async (req, res) => {
  try {
    const artists = await Artist.aggregate([
      { $sample: { size: 18 } },
      {
        $project: {
          name: 1,
          image: 1,
          flag: 1,
          _id: 1,
          country: 1,
          city: 1,
          ratingStats: 1,
          stageName: 1,
        },
      },
    ]);
    res.status(200).json(artists);
  } catch (error) {
    console.error("Error in getRandomArtists:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET SINGLE Artist
const getSingleArtist = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid Artist ID" });
    }
    const artist = await Artist.findById(id).select(
      "-createdAt -reviews -sex -genre -ratings"
    );
    if (!artist) {
      return res.status(404).json({ msg: "No artist found with this ID" });
    }
    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// CREATE artist
const createArtist = async (req, res) => {
  try {
    const {
      name,
      desc,
      stageName,
      country,
      city,
      label,
      bio,
      flag,
      birth,
      genre,
      profiles,
      image,
      gallery,
      sex,
    } = req.body;

    // Upload main artist image to Cloudinary
    const mainImageResult = await cloudinary.uploader.upload(image, {
      folder: "DJDB - Artist Images",
    });

    // Upload gallery images to Cloudinary
    const galleryUrls = await Promise.all(
      gallery.map(async (img) => {
        const result = await cloudinary.uploader.upload(img, {
          folder: "DJDB - Artist Gallery",
        });
        return result.secure_url;
      })
    );

    // Create new artist with Cloudinary URLs
    const artist = await Artist.create({
      name,
      desc,
      stageName,
      country,
      city,
      label,
      bio,
      flag,
      birth,
      genre,
      profiles,
      image: mainImageResult.secure_url,
      gallery: galleryUrls,
      sex,
    });

    res.status(201).json(artist);
  } catch (error) {
    console.error("Error in createArtist:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getRandomArtists,
  getSingleArtist,
  createArtist,
  getArtists,
};
