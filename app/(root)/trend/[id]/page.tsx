import TrendCard from "@/components/cards/TrendCard";
import Comment from "@/components/forms/Comment";
import { fetchTrendById } from "@/lib/actions/trend.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  const trend = await fetchTrendById(params.id);
  // const stringifyUserId = JSON.stringify(userInfo?._id);

  return (
    <section className="relative">
      <div>
        <TrendCard
          key={trend._id}
          id={trend._id}
          currentUserId={user?.id || ""}
          parentId={trend.parentId}
          content={trend.text}
          isComment={false}
          author={trend.author}
          community={trend.community}
          createdAt={trend.createdAt}
          comments={trend.children}
        />
      </div>
      <div className="mt-7">
        <Comment
          trendId={trend._id}
          currentUserImg={userInfo?.image}
          currentUserId={userInfo?._id}
        />
      </div>
      <div className="mt-10">
        {trend.children.map((trend: any) => (
          <TrendCard
            key={trend._id}
            id={trend._id}
            currentUserId={user?.id || ""}
            parentId={trend.parentId}
            content={trend.text}
            isComment={true}
            author={trend.author}
            community={trend.community}
            createdAt={trend.createdAt}
            comments={trend.children}
          />
        ))}
      </div>
    </section>
  );
};

export default Page;
