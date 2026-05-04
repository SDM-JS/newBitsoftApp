import BaseError from "../errors/base.error.js";
import { prisma } from "../lib/prisma.js";

class NewsController {
  async createNews(req, res, next) {
    try {
      const { title, description } = req.body;
      const { role } = req.student;

      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const news = await prisma.news.create({
        data: {
          title,
          description,
          pictureUrl: req.body.pictureUrl || "",
          videoId: req.body.videoId || "",
          url: req.body.url || "",
        },
      });
      return res.status(201).json(news);
    } catch (error) {
      console.log(error);
      // next(error);
    }
  }
  async getAllNews(req, res, next) {
    try {
      const allNews = await prisma.news.findMany();
      return res.json({ news: allNews });
    } catch (error) {
      next(error);
      console.log(error);
    }
  }
  async getLatestNews(req, res, next) {
    try {
      const latestNews = await prisma.news.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json({ news: latestNews[0] });
    } catch (error) {
      next(error);
    }
  }
  async deleteNews(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { newsId } = req.params;
      if (!newsId) {
        res.status(400).json({ error: "News Id is required!" });
        throw BaseError.BadRequest("News Id is required!");
      }
      await prisma.news.delete({
        where: {
          id: newsId,
        },
      });
      return res.status(200).json({ message: "News deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
  async updateNews(req, res, next) {
    try {
      const { role } = req.student;
      if (role !== "org::admin") {
        res.status(403).json({ error: "Forbidden" });
        throw BaseError.Forbidden();
      }
      const { newsId } = req.params;
      if (!newsId) {
        res.status(400).json({ error: "News Id is required!" });
        throw BaseError.BadRequest("News Id is required!");
      }
      const updatedNews = await prisma.news.update({
        where: {
          id: newsId,
        },
        data: {
          ...req.body,
        },
      });
      return res
        .status(200)
        .json({ updatedNews, message: "News updated successfully!" });
    } catch (error) {
      next(error);
    }
  }
}

export default new NewsController();
