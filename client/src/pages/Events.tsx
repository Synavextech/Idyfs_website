
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Event, Booking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, CheckCircle, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { apiRequest } from "@/lib/utils";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

function StripePaymentForm({ event, onSuccess }: { event: Event; onSuccess: (paymentId: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {},
            redirect: "if_required",
        });

        if (error) {
            toast({ title: "Payment failed", description: error.message, variant: "destructive" });
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            toast({ title: "Payment successful!" });
            onSuccess(paymentIntent.id);
        } else {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t mt-4">
            <PaymentElement />
            <Button disabled={!stripe || isProcessing} type="submit" className="w-full bg-[#04047a]">
                {isProcessing ? "Processing..." : `Pay $${event.price}`}
            </Button>
        </form>
    );
}

export default function Events() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [bookingEvent, setBookingEvent] = useState<Event | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | null>(null);
    const [clientSecret, setClientSecret] = useState("");
    const [selectedEventForGallery, setSelectedEventForGallery] = useState<Event | null>(null);
    const [currentGalleryImageIndex, setCurrentGalleryImageIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAutoPlaying && selectedEventForGallery?.images && selectedEventForGallery.images.length > 1) {
            interval = setInterval(() => {
                if (isShuffled) {
                    setCurrentGalleryImageIndex(Math.floor(Math.random() * selectedEventForGallery.images!.length));
                } else {
                    setCurrentGalleryImageIndex((prev) => (prev + 1) % selectedEventForGallery.images!.length);
                }
            }, 3000); // 3 seconds per slide
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAutoPlaying, isShuffled, selectedEventForGallery]);

    const { data: events, isLoading } = useQuery<Event[]>({
        queryKey: ["events"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });
            if (error) throw error;
            return data;
        }
    });

    const { data: userBookings } = useQuery<Booking[]>({
        queryKey: ["bookings", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            return data;
        },
        enabled: !!user
    });

    const bookingMutation = useMutation({
        mutationFn: async ({ eventId, paymentId, amount, bookingId }: { eventId: string; paymentId: string; amount: number; bookingId?: string }) => {
            const { data, error } = await supabase
                .from('bookings')
                .update({ payment_status: 'paid', payment_id: paymentId })
                .eq('event_id', eventId)
                .eq('user_id', user?.id)
                .eq('payment_status', 'pending');
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast({ title: "Event booked successfully!" });
            setBookingEvent(null);
            setPaymentMethod(null);
            setClientSecret("");
            queryClient.invalidateQueries({ queryKey: ["bookings", user?.id] });
        }
    });

    const createPendingBooking = async (eventId: string, amount: string) => {
        const { data: existing } = await supabase
            .from('bookings')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', user?.id)
            .eq('payment_status', 'pending')
            .maybeSingle();

        if (existing) return existing;

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                event_id: eventId,
                user_id: user?.id,
                payment_status: 'pending',
                amount: amount
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    };

    const handleBookNow = async (event: Event) => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to book events.", variant: "destructive" });
            sessionStorage.setItem("redirect_after_login", "/events");
            setLocation("/auth");
            return;
        }
        setBookingEvent(event);
    };

    const initializeStripe = async (event: Event) => {
        setPaymentMethod('stripe');
        try {
            const booking = await createPendingBooking(event.id, event.price?.toString() || "0");
            const res = await apiRequest("POST", "/api/create-payment-intent", {
                amount: Number(event.price) * 100,
                eventId: event.id,
                bookingId: booking.id
            });
            const data = await res.json();
            setClientSecret(data.clientSecret);
        } catch (err) {
            toast({ title: "Failed to initialize payment", variant: "destructive" });
        }
    };

    const isBooked = (eventId: string) => {
        return userBookings?.some(b => b.eventId === eventId && (b.paymentStatus === 'paid' || b.paymentStatus === 'completed'));
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col min-h-screen">
            <section className="bg-[#04047a] py-20 text-white text-center">
                <h1 className="text-4xl font-bold mb-4">Foundation Events</h1>
                <p className="text-lg opacity-90">Join our upcoming conferences, workshops, and summits.</p>
            </section>

            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events?.map((event) => (
                            <Card key={event.id} className="flex flex-col h-full hover:shadow-lg transition-all border-slate-200">
                                <div className="aspect-video relative overflow-hidden bg-slate-100 group cursor-pointer" onClick={() => {
                                    if (event.images && event.images.length > 0) {
                                        setSelectedEventForGallery(event);
                                        setCurrentGalleryImageIndex(0);
                                    }
                                }}>
                                    {event.images?.[0] ? (
                                        <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
                                    )}

                                    {event.images && event.images.length > 0 && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <Maximize2 className="text-white h-8 w-8" />
                                        </div>
                                    )}

                                    <div className="absolute top-4 right-4 bg-[#b8240d] text-white px-3 py-1 rounded-full font-bold z-10">
                                        ${event.price || "0"}
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-[#04047a]">{event.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> {format(new Date(event.date), 'PPP p')}
                                    </CardDescription>
                                    <CardDescription className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> {event.location}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-slate-600 line-clamp-4">{event.description}</p>
                                </CardContent>
                                <CardFooter className="pt-4 border-t">
                                    {isBooked(event.id) ? (
                                        <Button className="w-full bg-green-600" disabled>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Booked
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full bg-[#04047a]"
                                            onClick={() => handleBookNow(event)}
                                        >
                                            Book Now
                                        </Button>
                                    )}
                                </CardFooter>

                                {bookingEvent?.id === event.id && !isBooked(event.id) && (
                                    <div className="p-4 bg-white border-t space-y-4">
                                        {!paymentMethod ? (
                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold">Choose Payment Method:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button variant="outline" onClick={() => initializeStripe(event)}>Card</Button>
                                                    <Button variant="outline" onClick={() => setPaymentMethod('paypal')}>PayPal</Button>
                                                </div>
                                            </div>
                                        ) : paymentMethod === 'stripe' ? (
                                            clientSecret ? (
                                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                                    <StripePaymentForm
                                                        event={event}
                                                        onSuccess={(paymentId) => bookingMutation.mutate({ eventId: event.id, paymentId, amount: Number(event.price) })}
                                                    />
                                                </Elements>
                                            ) : (
                                                <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                                            )
                                        ) : (
                                            <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test" }}>
                                                <PayPalButtons
                                                    style={{ layout: "horizontal" }}
                                                    createOrder={async () => {
                                                        const booking = await createPendingBooking(event.id, event.price?.toString() || "0");
                                                        const res = await apiRequest("POST", "/api/create-paypal-order", {
                                                            amount: Number(event.price),
                                                            eventId: event.id,
                                                            bookingId: booking.id
                                                        });
                                                        const data = await res.json();
                                                        return data.id;
                                                    }}
                                                    onApprove={async (data) => {
                                                        try {
                                                            const res = await apiRequest("POST", "/api/capture-paypal-order", {
                                                                orderID: data.orderID
                                                            });
                                                            const captureData = await res.json();
                                                            if (captureData.status === "COMPLETED") {
                                                                bookingMutation.mutate({ eventId: event.id, paymentId: data.orderID, amount: Number(event.price || 0) });
                                                            } else {
                                                                toast({ title: "Payment failed", variant: "destructive", description: "Payment could not be captured." });
                                                            }
                                                        } catch (err) {
                                                            console.error("PayPal Capture Error", err);
                                                            toast({ title: "Payment capture error", variant: "destructive" });
                                                        }
                                                    }}
                                                />
                                            </PayPalScriptProvider>
                                        )}
                                        <Button variant="ghost" size="sm" className="w-full" onClick={() => { setBookingEvent(null); setPaymentMethod(null); }}>Cancel</Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fullscreen Gallery Overlay */}
            {selectedEventForGallery && selectedEventForGallery.images && selectedEventForGallery.images.length > 0 && (
                <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[60] p-2 bg-black/40 rounded-full"
                        onClick={() => {
                            setSelectedEventForGallery(null);
                            setIsAutoPlaying(false);
                            setIsShuffled(false);
                        }}
                    >
                        <X className="h-8 w-8" />
                    </button>

                    {selectedEventForGallery.images.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-4 z-[60] bg-black/40 rounded-full"
                                onClick={() => setCurrentGalleryImageIndex((prev) => (prev - 1 + selectedEventForGallery.images!.length) % selectedEventForGallery.images!.length)}
                            >
                                <ChevronLeft className="h-10 w-10" />
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-4 z-[60] bg-black/40 rounded-full"
                                onClick={() => setCurrentGalleryImageIndex((prev) => (prev + 1) % selectedEventForGallery.images!.length)}
                            >
                                <ChevronRight className="h-10 w-10" />
                            </button>
                        </>
                    )}

                    <div className="w-screen h-screen flex items-center justify-center relative bg-black">
                        <img
                            src={selectedEventForGallery.images[currentGalleryImageIndex]}
                            alt={`Gallery image ${currentGalleryImageIndex + 1}`}
                            className="w-full h-full object-cover select-none"
                        />
                    </div>

                    {selectedEventForGallery.images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full font-medium shadow-lg border border-white/10 z-[60]">
                            <span>{currentGalleryImageIndex + 1} / {selectedEventForGallery.images.length}</span>
                            <div className="h-6 w-px bg-white/20 mx-2"></div>
                            <button
                                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                                className={`text-sm tracking-wider font-bold transition-colors ${isAutoPlaying ? "text-green-400" : "hover:text-gray-300"}`}
                            >
                                {isAutoPlaying ? "STOP PLAYING" : "AUTO-PLAY"}
                            </button>
                            <div className="h-6 w-px bg-white/20 mx-2"></div>
                            <button
                                onClick={() => setIsShuffled(!isShuffled)}
                                className={`text-sm tracking-wider font-bold transition-colors ${isShuffled ? "text-purple-400" : "hover:text-gray-300"}`}
                            >
                                {isShuffled ? "SHUFFLE: ON" : "SHUFFLE: OFF"}
                            </button>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
