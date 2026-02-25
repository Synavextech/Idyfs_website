
import { useQuery, useMutation } from "@tanstack/react-query";
import { Blog as BlogType, Comment as CommentType, Profile as ProfileType } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { queryClient } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type BlogWithComments = BlogType & { comments: (CommentType & { user: ProfileType })[] };

export default function Blog() {
    const { user } = useAuth();
    // const { toast } = useToast();

    // Fetch blogs
    const { data: blogs, isLoading } = useQuery<BlogWithComments[]>({
        queryKey: ["blogs"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blogs')
                .select('*, comments(*, user:profiles(*))')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data.map((blog: any) => ({
                ...blog,
                imageUrl: blog.image_url || blog.imageUrl,
                createdAt: blog.created_at || blog.createdAt,
                authorId: blog.author_id || blog.authorId,
            })) as any as BlogWithComments[];
        }
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-20 flex justify-center">
                <p>Loading blogs...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section
                className="relative h-[300px] flex items-center justify-center text-white"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/images/blog.gif")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="container mx-auto px-4 z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Latest Updates</h1>
                    <p className="text-xl max-w-2xl mx-auto text-gray-200">Insights, news, and stories from our community and projects.</p>
                </div>
            </section>

            {/* Blog List */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs && blogs.length > 0 ? (
                            blogs.map((blog) => (
                                <BlogCard key={blog.id} blog={blog} user={user} />
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                <p className="text-xl">No posts available yet. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

function BlogCard({ blog, user }: { blog: BlogWithComments, user: any }) {
    const [comment, setComment] = useState("");
    const { toast } = useToast();
    const [showComments, setShowComments] = useState(false);

    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!user) throw new Error("Must be logged in");
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    content,
                    blog_id: blog.id,
                    user_id: user.id
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            setComment("");
            toast({ title: "Comment added" });
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
        },
        onError: (err) => {
            console.error(err);
            toast({ title: "Failed to add comment", variant: "destructive" });
        }
    });

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            {blog.imageUrl && (
                <div className="h-48 w-full overflow-hidden rounded-t-lg">
                    <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform hover:scale-105" />
                </div>
            )}
            <CardHeader>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{blog.createdAt ? format(new Date(blog.createdAt), 'PPP') : 'Recently'}</span>
                </div>
                <CardTitle className="text-xl line-clamp-2">{blog.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3 mb-4">{blog.content}</p>

                {showComments && (
                    <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold text-sm mb-2">Comments</h4>
                        {/* Comments List would go here - for now just showing input */}
                        <div className="space-y-2 mb-4">
                            {blog.comments && blog.comments.map(c => (
                                <div key={c.id} className="text-xs bg-muted p-2 rounded">
                                    <span className="font-bold">{c.user?.fullName || "User"}:</span> {c.content}
                                </div>
                            ))}
                        </div>
                        {user ? (
                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="Write a comment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="h-8 text-sm"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => commentMutation.mutate(comment)}
                                    disabled={!comment || commentMutation.isPending}
                                >
                                    Post
                                </Button>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">Log in to comment.</p>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t pt-4">
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setShowComments(!showComments)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {showComments ? "Hide Comments" : "Comments"}
                </Button>
            </CardFooter>
        </Card>
    );
}
