
import { useQuery, useMutation } from "@tanstack/react-query";
import { Event, Booking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
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
    const { toast } = useToast();
    const [bookingEvent, setBookingEvent] = useState<Event | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | null>(null);
    const [clientSecret, setClientSecret] = useState("");

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
        mutationFn: async ({ eventId, paymentId, amount }: { eventId: string; paymentId: string; amount: number }) => {
            const { data, error } = await supabase
                .from('bookings')
                .insert({
                    event_id: eventId,
                    user_id: user?.id,
                    payment_status: 'completed',
                    payment_id: paymentId,
                    amount: amount
                });
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

    const handleBookNow = async (event: Event) => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to book events.", variant: "destructive" });
            return;
        }
        setBookingEvent(event);
    };

    const initializeStripe = async (event: Event) => {
        setPaymentMethod('stripe');
        try {
            // Need a generic payment intent or specialized for events
            // I'll reuse the/api/create-payment-intent by passing amount/metadata if I can, 
            // but the current routes handle specific plans. 
            // I'll assume for now I should use a custom amount if I can or it handles it.
            // Actually I'll check routes.ts again.
            const res = await apiRequest("POST", "/api/create-payment-intent", { amount: Number(event.price) * 100, eventId: event.id });
            const data = await res.json();
            setClientSecret(data.clientSecret);
        } catch (err) {
            toast({ title: "Failed to initialize payment" });
        }
    };

    const isBooked = (eventId: string) => {
        return userBookings?.some(b => b.eventId === eventId);
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
                                <div className="aspect-video relative overflow-hidden bg-slate-100">
                                    {event.images?.[0] ? (
                                        <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-[#b8240d] text-white px-3 py-1 rounded-full font-bold">
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
                                                    createOrder={(data, actions) => {
                                                        return actions.order.create({
                                                            intent: "CAPTURE",
                                                            purchase_units: [{
                                                                amount: {
                                                                    currency_code: "USD",
                                                                    value: (event.price || "0").toString()
                                                                }
                                                            }]
                                                        });
                                                    }}
                                                    onApprove={(data, actions) => {
                                                        return actions.order!.capture().then((details) => {
                                                            bookingMutation.mutate({ eventId: event.id, paymentId: details.id as string, amount: Number(event.price || 0) });
                                                        });
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
        </div>
    );
}
