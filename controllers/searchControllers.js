const Artist = require("../models/artistsModel");
const Festival = require("../models/festivalModel");

const searchAll = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }
    // Create a case-insensitive regex pattern for the search
    const searchPattern = new RegExp(query, "i");
    const artists = await Artist.find({
      $or: [
        { name: searchPattern },
        { stageName: searchPattern },
        { genre: searchPattern },
      ],
    })
      .select("image name stageName genre")
      .limit(10);
    const festivals = await Festival.find({
      name: searchPattern,
    })
      .select("image name country")
      .limit(10);
    const results = {
      artists: artists.map((artist) => ({
        id: artist._id,
        name: artist.stageName || artist.name,
        image: artist.image,
        type: "artist",
        genre: artist.genre,
      })),
      festivals: festivals.map((festival) => ({
        id: festival._id,
        name: festival.name,
        image: festival.image,
        country: festival.country,
        type: "festival",
      })),
    };
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in search:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { searchAll };
