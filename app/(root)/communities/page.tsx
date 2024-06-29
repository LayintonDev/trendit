import CommunityCard from "@/components/cards/CommunityCard";
import UserCard from "@/components/cards/UserCard";
import PostTrend from "@/components/forms/PostTrend";
import ProfileHeader from "@/components/shared/ProfileHeader";
import TrendsTab from "@/components/shared/TrendsTab";
import { profileTabs } from "@/constants";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  const res = await fetchCommunities({
    searchString: "",
    pageNumber: 1,
    pageSize: 25,
  });
  return (
    <section>
      <h1
        className="head-text mb-10
      "
      >
        Search
      </h1>
      <div className="mt-14 flex flex-col gap-9">
        {res.communities.length === 0 ? (
          <p className="no-result">No result</p>
        ) : (
          <>
            {res.communities.map((community) => (
              <CommunityCard
                id={community.id}
                key={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default Page;
