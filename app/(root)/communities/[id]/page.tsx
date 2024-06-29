import UserCard from "@/components/cards/UserCard";
import ProfileHeader from "@/components/shared/ProfileHeader";
import TrendsTab from "@/components/shared/TrendsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { communityTabs } from "@/constants";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
const Page = async ({ params }: { params: { id: string } }) => {
  console.log(params.id);
  const user = await currentUser();
  if (!user) return null;

  const communuityDetails = await fetchCommunityDetails(params.id);
  return (
    <section>
      <ProfileHeader
        accountId={communuityDetails.id}
        authUserId={user.id}
        name={communuityDetails.name}
        username={communuityDetails.username}
        imgUrl={communuityDetails.image}
        bio={communuityDetails.bio}
        type="Community"
      />
      <div className="mt-0">
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="tab">
            {communityTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value}>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <p className="max-sm:hidden"> {tab.label}</p>
                {tab.label === "Trends" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {communuityDetails?.trends?.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="trends" className="w-full text-light-1">
            <TrendsTab
              currentUserId={user.id}
              accountId={communuityDetails._id}
              accountType="Community"
            />
          </TabsContent>
          <TabsContent value="members" className="w-full text-light-1">
            <section className="mt-9 flex flex-col gap-10">
              {communuityDetails?.members?.map((member: any) => (
                <UserCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  userType="User"
                />
              ))}
            </section>
          </TabsContent>
          <TabsContent value="requests" className="w-full text-light-1">
            <TrendsTab
              currentUserId={user.id}
              accountId={communuityDetails._id}
              accountType="Community"
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Page;
