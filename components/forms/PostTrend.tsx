"use client";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { usePathname, useRouter } from "next/navigation";
import { TrendValidation } from "@/lib/validations/trends";
import { createTrend } from "@/lib/actions/trend.actions";
interface Props {
  user: {
    username: string;
    name: string;
    bio: string;
    image: string;
    id: string;
    objectId: string;
  };
  btnTitle: string;
}

const PostTrend = ({ userId }: { userId: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(TrendValidation),
    defaultValues: {
      trend: "",
      accountId: userId,
    },
  });
  const onSubmit = async (values: z.infer<typeof TrendValidation>) => {
    await createTrend({
      text: values.trend,
      author: userId,
      communityId: null,
      path: pathname,
    });
    router.push("/");
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="trend"
          render={({ field }) => (
            <FormItem className="mt-10 flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea
                  rows={15}
                  {...field}
                  className="account-form_input no-focus"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary-500">
          Post Trend
        </Button>
      </form>
    </Form>
  );
};

export default PostTrend;
