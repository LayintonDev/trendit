import TrendCard from "@/components/cards/TrendCard";
import { fetchTrends } from "@/lib/actions/trend.actions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const trends = await fetchTrends(1, 30);
  const user = await currentUser();

  return (
    <main className="">
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {trends.trends.length > 0 ? (
          trends.trends.map((trend) => (
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
          ))
        ) : (
          <p className="no-result">No trends found</p>
        )}
      </section>
    </main>
  );
}
