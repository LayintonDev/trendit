"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Trend from "../models/trend.model";
import { FilterQuery, SortOrder } from "mongoose";
import Community from "../models/community.model";

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}): Promise<void> {
  try {
    await connectToDB();
    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    console.log(error.message);
    throw new Error(`Error updating/creating user, ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    await connectToDB();
    return await User.findOne({ id: userId });
  } catch (error: any) {
    console.log(error);
    throw new Error("Error fetching user");
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    await connectToDB();
    const trends = await User.findOne({ id: userId }).populate({
      path: "trends",
      model: Trend,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
        },
        {
          path: "children",
          model: Trend,
          populate: {
            path: "author",
            model: User,
            select: "id name image",
          },
        },
      ],
    });

    return trends;
  } catch (error: any) {
    console.log(error);
    throw new Error("Error fetching user posts");
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    await connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };
    if (searchString.trim() !== "") {
      query.$or = [
        { name: { $regex: regex } },
        { username: { $regex: regex } },
      ];
    }

    const sortOptions = {
      createdAt: sortBy,
    };
    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);
    const totalUsersCount = await User.countDocuments(query);
    const users = await usersQuery.exec();
    const isNext = totalUsersCount > skipAmount + users.length;
    return { users, isNext };
  } catch (error: any) {
    console.log(error);
    throw new Error("Failed to fetch users");
  }
}

export async function fetchActivities(userId: string) {
  try {
    await connectToDB();
    //fetch all users trend post
    const userTrends = await Trend.find({ author: userId });

    //collect all replies (child trends) from the users post
    const childTrendIds = userTrends.reduce((acc, userTrend) => {
      return acc.concat(userTrend.children);
    }, []);
    //find all trend in the db that is in the users post replies and the reply is not the current user replie
    const replies = await Trend.find({
      _id: { $in: childTrendIds },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });
    return replies;
  } catch (error: any) {
    console.log(error);
    throw new Error("failed to fetch activity");
  }
}
