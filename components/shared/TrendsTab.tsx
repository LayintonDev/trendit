import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import TrendCard from "../cards/TrendCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}
const TrendsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let res: any;

  if (accountType === "Community") {
    res = await fetchCommunityPosts(accountId);
  } else {
    res = await fetchUserPosts(accountId);
  }
  if (!res) redirect("/");
  return (
    <section className="mt-9 flex flex-col gap-10">
      {res.trends.map((trend: any) => (
        <TrendCard
          key={trend._id}
          id={trend._id}
          currentUserId={currentUserId}
          parentId={trend.parentId}
          content={trend.text}
          author={
            accountType === "User"
              ? {
                  name: res.name,
                  image: res.image,
                  id: res.id,
                }
              : {
                  name: trend.author.name,
                  image: trend.author.image,
                  id: trend.author._id,
                }
          } //todo
          community={trend.community} //todo
          createdAt={trend.createdAt}
          comments={trend.children}
        />
      ))}
    </section>
  );
};

export default TrendsTab;
