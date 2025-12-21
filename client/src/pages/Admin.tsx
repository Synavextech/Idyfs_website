
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Edit2, Upload, Image as ImageIcon, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Event, insertEventSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

function BlogManager() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
        if (!error) setBlogs(data || []);
    };

    const onSubmitBlog = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const imageUrl = formData.get('imageUrl') as string;

        const { error } = await supabase.from('blogs').insert({ title, content, imageUrl });
        if (!error) {
            toast({ title: "Blog posted!" });
            fetchBlogs();
            (e.target as HTMLFormElement).reset();
        }
        setIsSubmitting(false);
    };

    const deleteBlog = async (id: string) => {
        if (!confirm("Delete post?")) return;
        const { error } = await supabase.from('blogs').delete().eq('id', id);
        if (!error) {
            toast({ title: "Deleted" });
            fetchBlogs();
        }
    };

    return (
        <>
            <Card className="lg:col-span-1">
                <CardHeader><CardTitle>Create Post</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={onSubmitBlog} className="space-y-4">
                        <Input name="title" placeholder="Title" required />
                        <Input name="imageUrl" placeholder="Image URL (e.g. from Unsplash)" />
                        <textarea name="content" className="w-full min-h-[200px] p-2 border rounded-md" placeholder="Content..." required />
                        <Button type="submit" disabled={isSubmitting} className="w-full">Post Blog</Button>
                    </form>
                </CardContent>
            </Card>
            <div className="lg:col-span-2 space-y-4">
                {blogs.map(blog => (
                    <Card key={blog.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{blog.title}</h3>
                                <p className="text-sm text-gray-500">{format(new Date(blog.createdAt), 'PPP')}</p>
                            </div>
                            <Button variant="ghost" className="text-red-500" onClick={() => deleteBlog(blog.id)}><Trash2 className="h-4 w-4" /></Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}

export default function AdminDashboard() {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'events' | 'blogs'>('events');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (error: any) {
            toast({ title: "Error fetching events", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (): Promise<string[]> => {
        const urls: string[] = [];
        setUploading(true);

        for (const file of selectedImages) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `events/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('event-media')
                .upload(filePath, file);

            if (uploadError) {
                toast({ title: "Upload error", description: uploadError.message, variant: "destructive" });
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('event-media')
                .getPublicUrl(filePath);

            urls.push(publicUrl);
        }

        setUploading(false);
        return urls;
    };

    const onSubmitEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const date = formData.get('date') as string;
        const location = formData.get('location') as string;
        const price = formData.get('price') as string;

        try {
            const imageUrls = await uploadImages();

            const { error } = await supabase
                .from('events')
                .insert({
                    title,
                    description,
                    date: new Date(date).toISOString(),
                    location,
                    price: price || "0",
                    images: imageUrls
                });

            if (error) throw error;

            toast({ title: "Event created successfully!" });
            fetchEvents();
            // Reset form
            (e.target as HTMLFormElement).reset();
            setSelectedImages([]);
            setImagePreviews([]);
        } catch (error: any) {
            toast({ title: "Error creating event", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteEvent = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Event deleted" });
            fetchEvents();
        } catch (error: any) {
            toast({ title: "Error deleting event", description: error.message, variant: "destructive" });
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
                <div className="flex space-x-2">
                    <Button
                        variant={activeTab === 'events' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('events')}
                    >
                        Events
                    </Button>
                    <Button
                        variant={activeTab === 'blogs' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('blogs')}
                    >
                        Blogs
                    </Button>
                </div>
            </div>

            {activeTab === 'events' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Event Form */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Create New Event</CardTitle>
                            <CardDescription>Add a past or upcoming event to the gallery.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmitEvent} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Event Title</Label>
                                    <Input id="title" name="title" required placeholder="Global Youth Summit" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input id="date" name="date" type="datetime-local" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" name="location" placeholder="Nairobi, Kenya" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        className="w-full min-h-[100px] p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Brief summary of the event..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Images</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <Label
                                            htmlFor="image-upload"
                                            className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex flex-col items-center">
                                                <Upload className="h-6 w-6 text-gray-400" />
                                                <span className="text-sm text-gray-500">Click to upload images</span>
                                            </div>
                                        </Label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {imagePreviews.map((src, i) => (
                                            <div key={i} className="relative group aspect-square">
                                                <img src={src} className="w-full h-full object-cover rounded-md" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(i)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting || uploading}>
                                    {(isSubmitting || uploading) ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Create Event
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Events List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-primary mb-4">Existing Events</h2>
                        {events.length === 0 ? (
                            <p className="text-gray-500 italic">No events found.</p>
                        ) : (
                            events.map(event => (
                                <Card key={event.id}>
                                    <CardContent className="p-4 flex items-start space-x-4">
                                        {event.images?.[0] ? (
                                            <img src={event.images[0]} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                                        ) : (
                                            <div className="w-24 h-24 bg-slate-100 flex items-center justify-center rounded-md flex-shrink-0">
                                                <ImageIcon className="h-8 w-8 text-gray-300" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{event.title}</h3>
                                            <p className="text-sm text-gray-500 mb-2">
                                                {format(new Date(event.date), 'PPP p')} • {event.location} • ${event.price}
                                            </p>
                                            <p className="text-gray-600 line-clamp-2 text-sm">{event.description}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteEvent(event.id)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'blogs' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <BlogManager />
                </div>
            )}
        </div>
    );
}

