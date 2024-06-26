import UserCard from "@/components/cards/UserCard";
import PostTrend from "@/components/forms/PostTrend";
import ProfileHeader from "@/components/shared/ProfileHeader";
import TrendsTab from "@/components/shared/TrendsTab";
import { profileTabs } from "@/constants";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  const res = await fetchUsers({
    userId: user.id,
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
        {res.users.length === 0 ? (
          <p className="no-result">No result</p>
        ) : (
          <>
            {res.users.map((user) => (
              <UserCard
                id={user.id}
                key={user.id}
                name={user.name}
                username={user.username}
                imgUrl={user.image}
                userType="User"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default Page;
