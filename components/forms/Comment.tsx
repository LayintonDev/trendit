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
import { Input } from "../ui/input";
import { usePathname, useRouter } from "next/navigation";
import { CommentValidation } from "@/lib/validations/trends";
import Image from "next/image";
import { addCommentToTrend } from "@/lib/actions/trend.actions";
import { threadId } from "worker_threads";

interface Props {
  trendId: string;
  currentUserImg: string;
  currentUserId: string;
}

const Comment = ({ trendId, currentUserImg, currentUserId }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      trend: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    console.log("SUBMITTING");
    await addCommentToTrend(trendId, values.trend, currentUserId, pathname);
    form.reset();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
        <FormField
          control={form.control}
          name="trend"
          render={({ field }) => (
            <FormItem className="flex w-full gap-3 items-center">
              <FormLabel>
                <Image
                  src={currentUserImg}
                  alt="user"
                  width={44}
                  height={44}
                  className="rounded-full object-cover h-auto w-auto"
                />
              </FormLabel>
              <FormControl className="border border-none bg-transparent ">
                <Input
                  type="text"
                  placeholder="Comment..."
                  {...field}
                  className="no-focus  text-light-1 outline-none"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className=" comment-form_btn">
          Reply
        </Button>
      </form>
    </Form>
  );
};

export default Comment;
