
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { apiRequest } from "@/lib/utils"; // Keep API request utility
import { supabase } from "@/lib/supabase"; // Import supabase

// Initialize Stripe outside component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

const QUESTIONS = [
    {
        id: 1,
        question: "What does IDYFS stand for?",
        options: [
            "International Development Youth Foundation Services",
            "International Development Youth Forum Services",
            "International Development Youth Innovation Services",
            "International Development Youth Enterprises Services"
        ],
        correctAnswer: 0 // Index
    },
    {
        id: 2,
        question: "Which continent does IDYFS primarily focus on?",
        options: ["Asia", "Europe", "Africa", "South America"],
        correctAnswer: 2
    },
    {
        id: 3,
        question: "What is one of the primary goals of IDYFS?",
        options: [
            "To promote technology startups",
            "To Provide Certificate for IDYFS for NGOs",
            "To run educational institutions",
            "To provide IDYFS services"
        ],
        correctAnswer: 1
    },
    {
        id: 4,
        question: "What type of organizations can join IDYFS?",
        options: [
            "Only government bodies",
            "Only profit-making companies",
            "NGOs",
            "Only academic institutions"
        ],
        correctAnswer: 2
    },
    {
        id: 5,
        question: "What does IDYFS aim to protect?",
        options: [
            "Environmental laws",
            "NGO staff rights",
            "Government regulations",
            "Corporate interests"
        ],
        correctAnswer: 1
    },
    {
        id: 6,
        question: "Who benefits from IDYFS's work?",
        options: [
            "Government officials",
            "NGO staff and organizations",
            "Large corporations",
            "Private investors"
        ],
        correctAnswer: 2
    },
    {
        id: 7,
        question: "What is a key component of IDYFS's mission?",
        options: [
            "Work staff ethics",
            "Stock market investment",
            "Political campaigns",
            "Real estate development"
        ],
        correctAnswer: 1
    },
    {
        id: 8,
        question: "Which of these is a benefit of joining IDYFS?",
        options: [
            "Access to social media followers",
            "Enhanced protection for NGO staff",
            "Membership in a global banking network",
            "Discounts on international flights"
        ],
        correctAnswer: 3
    },
    {
        id: 9,
        question: "IDYFS primarily works in which sector?",
        options: [
            "Tourism",
            "Non-Governmental Organizations",
            "Manufacturing",
            "Retail"
        ],
        correctAnswer: 1
    },
    {
        id: 10,
        question: "How does IDYFS help NGOs?",
        options: [
            "By offering travel services",
            "By protecting staff rights",
            "By developing gaming apps",
            "By running educational courses"
        ],
        correctAnswer: 2
    },
    {
        id: 11,
        question: "What is a focus area of IDYFS regarding staff?",
        options: [
            "Staff relocation services",
            "Staff rights protection",
            "Social media management",
            "Staff entertainment programs"
        ],
        correctAnswer: 2
    },
    {
        id: 12,
        question: "What type of ethics does IDYFS promote?",
        options: [
            "Corporate ethics",
            "Work staff ethics",
            "Political ethics",
            "Consumer ethics"
        ],
        correctAnswer: 1
    },
    {
        id: 13,
        question: "Who can become a member of IDYFS?",
        options: [
            "Any individual",
            "Government agencies only",
            "NGOs in Africa",
            "Multinational corporations"
        ],
        correctAnswer: 1
    },
    {
        id: 14,
        question: "What is one benefit of IDYFS membership for NGOs?",
        options: [
            "Tax exemptions",
            "Networking opportunities",
            "Ownership of properties",
            "Personal loans"
        ],
        correctAnswer: 2
    },
    {
        id: 15,
        question: "What does IDYFS stand against in NGO workplaces?",
        options: [
            "High salaries",
            "Work staff abuse",
            "Profit-making",
            "Government policies"
        ],
        correctAnswer: 2
    },
    {
        id: 16,
        question: "What is the full form of NGO?",
        options: [
            "Non-Governmental Organization",
            "National Government Organization",
            "Non-Growth Organization",
            "National General Office"
        ],
        correctAnswer: 1
    },
    {
        id: 17,
        question: "Which of these is a key ethical practice promoted by IDYFS?",
        options: [
            "Data monetization",
            "Transparency in operations",
            "Profit maximization",
            "Exclusive partnerships"
        ],
        correctAnswer: 2
    },
    {
        id: 18,
        question: "What legal frameworks does IDYFS help NGOs comply with?",
        options: [
            "International trade laws",
            "NGO operational standards and staff rights laws",
            "Financial market regulations",
            "Real estate laws"
        ],
        correctAnswer: 2
    },
    {
        id: 19,
        question: "What is the significance of staff rights in IDYFS's work?",
        options: [
            "It ensures proper marketing",
            "It safeguards NGO staff from exploitation",
            "It increases NGO profitability",
            "It develops staff technical skills"
        ],
        correctAnswer: 2
    },
    {
        id: 20,
        question: "Which of the following is a core principle of IDYFS's ethical guidelines?",
        options: [
            "Confidentiality of donor information",
            "High-profit returns",
            "Staff holiday bonuses",
            "Real estate investments"
        ],
        correctAnswer: 0
    }
];

function StripePaymentForm({ onSuccess }: { onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

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
            onSuccess();
        } else {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <Button disabled={!stripe || isProcessing} type="submit" className="w-full">
                {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
        </form>
    );
}

export default function Onboard() {
    const [step, setStep] = useState<'intro' | 'quiz' | 'details' | 'membership' | 'payment' | 'complete'>('intro');
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [plan, setPlan] = useState<string>("monthly");
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
    const [clientSecret, setClientSecret] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const { toast } = useToast();
    const { registerMutation, user, profile } = useAuth();
    const [isDownloading, setIsDownloading] = useState(false);

    if (user && step !== 'complete') {
        // If already logged in, maybe redirect or show different view?
    }

    const handleStartQuiz = () => {
        setStep('quiz');
    };

    const handleAnswer = (questionId: number, optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const calculateScore = () => {
        let score = 0;
        QUESTIONS.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                score++;
            }
        });
        return score;
    };

    const handleSubmitQuiz = () => {
        const score = calculateScore();
        const passingScore = 2; // e.g., 2 out of 20 for testing

        if (Object.keys(answers).length < QUESTIONS.length) {
            toast({ title: "Please answer all questions", variant: "destructive" });
            return;
        }

        if (score >= passingScore) {
            toast({ title: "Congratulations!", description: `You passed the eligibility test with ${score}/${QUESTIONS.length}.` });

            if (user) {
                // If already logged in, skip details and go to membership
                // But we still need the name for the certificate if it's not in the profile
                setName(profile?.fullName || user.user_metadata?.full_name || "");
                setEmail(user.email || "");
                setStep('membership');
            } else {
                setStep('details');
            }
        } else {
            toast({ title: "Test Failed", description: `You scored ${score}/${QUESTIONS.length}. Please try again.`, variant: "destructive" });
            setAnswers({});
            setStep('intro'); // Reset
        }
    };

    const handleDetailsSubmit = () => {
        if (!name || !email || !password || !acceptedTerms) {
            toast({ title: "Please fill all fields and accept terms.", variant: "destructive" });
            return;
        }
        setStep('membership');
    };

    const handleMembershipSubmit = async () => {
        if (!plan) {
            toast({ title: "Please select a membership plan.", variant: "destructive" });
            return;
        }
        setStep('payment');

        if (paymentMethod === 'stripe') {
            try {
                // Now purely public endpoint or with generic auth disabled for intent creation if needed
                const res = await apiRequest("POST", "/api/create-payment-intent", { plan });
                const data = await res.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error(err);
                toast({ title: "Failed to initialize payment", variant: "destructive" });
            }
        }
    };

    const handleRegistration = async () => {
        try {
            let userId = user?.id;

            if (!userId) {
                await registerMutation.mutateAsync({ password, email, name, plan });
                const { data: { session } } = await supabase.auth.getSession();
                userId = session?.user?.id;
            }

            if (userId) {
                const startDate = new Date();
                let endDate = new Date();
                if (plan === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
                else if (plan === 'quarterly') endDate.setMonth(endDate.getMonth() + 3);
                else if (plan === 'annual') endDate.setFullYear(endDate.getFullYear() + 1);

                await supabase.from('subscriptions').insert({
                    user_id: userId,
                    plan_name: plan,
                    status: 'active',
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    amount: plan === 'monthly' ? '95.00' : plan === 'quarterly' ? '150.00' : '350.00'
                });

                // Also update profile name if it was missing and we got it from the form
                if (name && (!profile?.fullName)) {
                    await supabase.from('profiles').update({ fullName: name }).eq('id', userId);
                }
            }

            setStep('complete');
        } catch (error) {
            console.error(error);
            // Error handling handled by useAuth toast mostly
        }
    };

    const handlePayPalApprove = async (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
            toast({ title: "Payment Successful", description: "Transaction completed by " + details.payer.name.given_name });
            handleRegistration();
        });
    };

    const handleDownloadCertificate = async () => {
        try {
            setIsDownloading(true);
            const response = await apiRequest("POST", '/api/certificate', { name });

            if (!response.ok) {
                throw new Error('Failed to generate certificate');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `IDYFS_Certificate_${name.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
            toast({ title: "Error downloading certificate", description: "Please try again later.", variant: "destructive" });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Hero Section */}
            <section
                className="relative h-[250px] flex items-center justify-center text-white"
                style={{
                    backgroundColor: '#04047a',
                    backgroundImage: 'linear-gradient(rgba(4, 4, 122, 0.9), rgba(4, 4, 122, 0.9)), url("/images/onboard.gif")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="container mx-auto px-4 z-10 text-center">
                    <h1 className="text-3xl font-bold mb-2">Become a Member</h1>
                    <p className="text-lg opacity-90">Join our community of scholars and change-makers.</p>
                </div>
            </section>

            <div className="flex-1 container mx-auto px-4 py-12 flex justify-center">
                <Card className="w-full max-w-2xl">
                    {step === 'intro' && (
                        <>
                            <CardHeader>
                                <CardTitle>IDYFS Eligibility Test</CardTitle>
                                <CardDescription>
                                    To ensure our members are aligned with our mission, please take this brief eligibility test.
                                    It consists of {QUESTIONS.length} multiple-choice questions.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button className="w-full" onClick={handleStartQuiz}>Start Test</Button>
                            </CardFooter>
                        </>
                    )}

                    {step === 'quiz' && (
                        <>
                            <CardHeader>
                                <CardTitle>Eligibility Test</CardTitle>
                                <CardDescription>Answer the following questions correctly to proceed.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {QUESTIONS.map((q, index) => (
                                    <div key={q.id} className="space-y-4">
                                        <h3 className="font-medium text-gray-900">{index + 1}. {q.question}</h3>
                                        <RadioGroup onValueChange={(val: string) => handleAnswer(q.id, parseInt(val))}>
                                            {q.options.map((option, optIdx) => (
                                                <div key={optIdx} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={optIdx.toString()} id={`q${q.id}-opt${optIdx}`} />
                                                    <Label htmlFor={`q${q.id}-opt${optIdx}`}>{option}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={handleSubmitQuiz}>Submit Answers</Button>
                            </CardFooter>
                        </>
                    )}

                    {(step === 'details') && (
                        <>
                            <CardHeader>
                                <CardTitle>Create Your Account</CardTitle>
                                <CardDescription>You are eligible! Please create your account details below.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name (for Certificate)</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={acceptedTerms}
                                        onCheckedChange={(checked: boolean) => setAcceptedTerms(checked)}
                                    />
                                    <Label htmlFor="terms" className="text-sm">
                                        I accept the <a href="#" className="text-primary underline">Terms and Conditions</a> and Privacy Policy.
                                    </Label>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={handleDetailsSubmit}>Next: Select Membership</Button>
                            </CardFooter>
                        </>
                    )}

                    {step === 'membership' && (
                        <>
                            <CardHeader>
                                <CardTitle>Select Membership Plan</CardTitle>
                                <CardDescription>Choose a plan that works best for you.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <RadioGroup value={plan} onValueChange={setPlan} className="space-y-4">
                                    <div className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${plan === 'monthly' ? 'border-primary bg-primary/5' : 'border-gray-200'}`} onClick={() => setPlan('monthly')}>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="monthly" id="monthly" />
                                            <div>
                                                <Label htmlFor="monthly" className="text-base font-semibold cursor-pointer">Monthly Membership</Label>
                                                <p className="text-sm text-gray-500">Full access for one month.</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-lg">$95</span>
                                    </div>

                                    <div className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${plan === 'quarterly' ? 'border-primary bg-primary/5' : 'border-gray-200'}`} onClick={() => setPlan('quarterly')}>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="quarterly" id="quarterly" />
                                            <div>
                                                <Label htmlFor="quarterly" className="text-base font-semibold cursor-pointer">3 Months Membership</Label>
                                                <p className="text-sm text-gray-500">Save with a quarterly plan.</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-lg">$150</span>
                                    </div>

                                    <div className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${plan === 'annual' ? 'border-primary bg-primary/5' : 'border-gray-200'}`} onClick={() => setPlan('annual')}>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="annual" id="annual" />
                                            <div>
                                                <Label htmlFor="annual" className="text-base font-semibold cursor-pointer">Annual Membership</Label>
                                                <p className="text-sm text-gray-500">Best value for long-term impact.</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-lg">$350</span>
                                    </div>
                                </RadioGroup>

                                <div className="space-y-4 pt-4 border-t items-center">
                                    <Label className="text-base font-semibold">Payment Method</Label>
                                    <RadioGroup value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)} className="flex space-x-4">
                                                                                <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="paypal" id="paypal" />
                                            <Label htmlFor="paypal">PayPal/card</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="stripe" id="stripe" />
                                            <Label htmlFor="stripe">Other options</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep('details')}>Back</Button>
                                <Button onClick={handleMembershipSubmit}> Complete Payment and Generate Certificate
                                </Button>
                            </CardFooter>
                        </>
                    )}

                    {step === 'payment' && (
                        <>
                            <CardHeader>
                                <CardTitle>Complete Payment</CardTitle>
                                <CardDescription>Securely pay for your {plan} membership.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {paymentMethod === 'stripe' ? (
                                    clientSecret ? (
                                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                                            <StripePaymentForm onSuccess={handleRegistration} />
                                        </Elements>
                                    ) : (
                                        <div className="flex justify-center p-4">Loading payment details...</div>
                                    )
                                ) : (
                                    <div className="w-full">
                                        <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                                            <PayPalButtons
                                                style={{ layout: "vertical" }}
                                                createOrder={(data, actions) => {
                                                    let amount = "95.00";
                                                    if (plan === 'quarterly') amount = "150.00";
                                                    if (plan === 'annual') amount = "350.00";

                                                    return actions.order.create({
                                                        intent: "CAPTURE",
                                                        purchase_units: [{
                                                            amount: {
                                                                currency_code: "USD",
                                                                value: amount
                                                            }
                                                        }]
                                                    });
                                                }}
                                                onApprove={handlePayPalApprove}
                                            />
                                        </PayPalScriptProvider>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep('membership')}>Back</Button>
                            </CardFooter>
                        </>
                    )}

                    {step === 'complete' && (
                        <div className="py-10 text-center space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-green-600 mb-4">Welcome Aboard!</h2>
                                <p className="text-gray-600">Your account has been created and your {plan} membership is active.</p>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 inline-block max-w-sm w-full mx-auto">
                                <h3 className="font-semibold text-lg mb-2">Your IDYFS Certificate</h3>
                                <p className="text-sm text-gray-500 mb-4">Download your personalized membership certificate.</p>
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={handleDownloadCertificate}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? (
                                        "Generating..."
                                    ) : (
                                        <>  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                            Download Certificate
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div>
                                <Button onClick={() => window.location.href = '/'} variant="link">Go to Home Dashboard</Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
