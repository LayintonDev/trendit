"use server";
import { revalidatePath } from "next/cache";
import Trend from "../models/trend.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}
export async function createTrend({ text, author, communityId, path }: Params) {
  try {
    await connectToDB();
    const trend = await Trend.create({ text, author, community: null });

    await User.findByIdAndUpdate(author, { $push: { trends: trend._id } });

    revalidatePath(path);
  } catch (error: any) {
    console.log(error.message);
    throw new Error("Error creating trend");
  }
}

export async function fetchTrends(pageNumber = 1, pageSize = 20) {
  try {
    await connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    //Get trends that are top level trends, i.e they have no parent trend
    const trendQuery = Trend.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "author",
        model: User,
      })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });
    const totalTrendsCount = await Trend.countDocuments({
      parentId: { $in: [null, undefined] },
    });
    const trends = await trendQuery.exec();
    const isNext = skipAmount + trends.length < totalTrendsCount;
    return { trends, isNext };
  } catch (error: any) {
    console.log(error.message);
    throw new Error("Error fetching trends");
  }
}

export async function fetchTrendById(trendId: string) {
  try {
    await connectToDB();

    const trendQuery = Trend.findById(trendId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id name parentId image",
          },
          {
            path: "children",
            model: Trend,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      });

    const trend = await trendQuery.exec();

    return trend;
  } catch (error: any) {
    console.log(error.message);
    throw new Error("Error fetching trend");
  }
}

export async function addCommentToTrend(
  trendId: string,
  commentText: string,
  userId: string,
  path: string
) {
  try {
    console.log("REACHED HERE");
    await connectToDB();
    const originalTrend = await Trend.findById(trendId);
    if (!originalTrend) throw new Error("Trend not found");
    const commentTrend = new Trend({
      text: commentText,
      author: userId,
      parentId: trendId,
    });
    const savedCommentTrend = await commentTrend.save();
    originalTrend.children.push(savedCommentTrend._id);
    await originalTrend.save();
    revalidatePath(path);
  } catch (error: any) {
    console.log(error.message);
    throw new Error("Error creating comment");
  }
}
