const News = require("../models/newsModels");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getNews = async (req, res) => {
  try {
    const newsData = await News.find({});
    res.status(200).json(newsData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createNews = async (req, res) => {
  try {
    const { poster, headline, desc, clip, newsLink } = req.body;
    const newsPosterUpload = await cloudinary.uploader.upload(poster, {
      folder: "DJDB - News Posters",
    });
    const news = await News.create({
      poster: newsPosterUpload.secure_url,
      headline,
      desc,
      clip,
      newsLink,
    });
    const newsCount = await News.countDocuments();
    if (newsCount > 10) {
      const oldestNews = await News.findOne().sort({ createdAt: 1 });
      if (oldestNews) {
        await News.findByIdAndDelete(oldestNews._id);
      }
    }
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getNews,
  createNews,
};
