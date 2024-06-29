"use server";
import { revalidatePath } from "next/cache";
import Trend from "../models/trend.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Community from "../models/community.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}
export async function createTrend({ text, author, communityId, path }: Params) {
  try {
    await connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      {
        _id: 1,
      }
    );

    const trend = await Trend.create({
      text,
      author,
      community: communityIdObject._id,
    });

    await User.findByIdAndUpdate(author, { $push: { trends: trend._id } });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(
        { _id: communityIdObject._id },
        {
          $push: { trends: trend._id },
        }
      );
    }

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
        path: "community",
        model: Community,
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
        path: "community",
        model: Community,
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

async function fetchAllChildTrends(trendId: string): Promise<any[]> {
  const childTrends = await Trend.find({ parentId: trendId });

  const descendantTrends = [];
  for (const childTrend of childTrends) {
    const descendants = await fetchAllChildTrends(childTrend._id);
    descendantTrends.push(childTrend, ...descendants);
  }

  return descendantTrends;
}

export async function deleteTrend(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the Trend to be deleted (the main Trend)
    const mainTrend = await Trend.findById(id).populate("author community");

    if (!mainTrend) {
      throw new Error("Trend not found");
    }

    // Fetch all child Trends and their descendants recursively
    const descendantTrends = await fetchAllChildTrends(id);

    // Get all descendant Trend IDs including the main Trend ID and child Trend IDs
    const descendantTrendIds = [
      id,
      ...descendantTrends.map((trend) => trend._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantTrends.map((trend) => trend.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainTrend.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantTrends.map((trend) => trend.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainTrend.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child Trends and their descendants
    await Trend.deleteMany({ _id: { $in: descendantTrendIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { Trends: { $in: descendantTrendIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { Trends: { $in: descendantTrendIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete Trend: ${error.message}`);
  }
}
