
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Event } from "@shared/schema";
import { motion } from "framer-motion";

const PAST_EVENTS = [
    {
        src: "https://www.youtube.com/embed/UOzoH6bEwSA?si=BkhOeiz5E4wx9zI-",
        title: "Highlights from our recent activities",
        description: "Engaging moments showcasing sustainable development goals and youth leadership."
    },
    {
        src: "https://www.youtube.com/embed/ktqZa3-yZWQ?si=iV7ybPJDzwEEBdMv",
        title: "Youth Tech For Good",
        description: "Empowering young developers to build digital solutions for their local communities."
    },
    {
        src: "https://www.youtube.com/embed/s5BtlDlRwsQ?si=64DNd1oayITKki3n",
        title: "Community Outreach",
        description: "Connecting scholars and professionals to drive impactful community change."
    }
];

const WHO_WE_ARE_SECTIONS = [
    {
        title: "Networking Opportunities",
        image: "/images/us_network_Opportunities.gif",
        description: "We provide networking opportunities and increase access to education to enhance economic and socially sustainable development by bridging the gap between talent and opportunity. This empowers the next generation of leaders to engage in research and development that contribute to the advancement of knowledge and innovation."
    },
    {
        title: "Education and Skill Development",
        image: "/images/us_Education _Skill Development.gif",
        description: "Offering educational resources, vocational training, and workshops to equip young people with the skills and knowledge they need to succeed in the workforce and in their communities"
    },
    {
        title: "Leadership Development",
        image: "/images/us_Leadership_Development.gif",
        description: "Fostering leadership skills, encouraging young people to become active participants in their communities and to advocate for their own rights and interests."
    },
    {
        title: "Social Support & Resilience",
        image: "/images/us_Social_Support.gif",
        description: "Providing counseling, mentoring, and social support to help young people cope with challenges and build resilience."
    },
    {
        title: "Access to Opportunities",
        image: "/images/us_Access _Opportunities.gif",
        description: "Connecting youth with resources and opportunities like scholarships, internships, and job placement assistance."
    },
    {
        title: "Youth Economic Empowerment",
        image: "/images/us_Economic_Empowerment.gif",
        description: "Entrepreneurship training, access to finance through microloans or grants, and market support for youth-owned businesses."
    }
];

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

export default function Landing() {
    const [events, setEvents] = useState<Event[]>([]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const FAQs = [
        {
            question: "How to create certificates",
            answer: "Once you complete the eligibility test and sign up for membership, you can download your personalized certificate directly from the confirmation step. Your certificate will feature your provided full name."
        },
        {
            question: "How to book events",
            answer: "Navigate to the 'Events' section from the top or bottom menubar. Browse the list of foundations events, click 'Book Now', and you can seamlessly secure your slot via card or PayPal. Make sure you are logged into your profile."
        },
        {
            question: "How are events handled?",
            answer: "After selecting an event to book and successfully submitting a booking payment, your booking status changes to Confirmed / Paid automatically. If a payment is canceled or fails, your booking will remain in a pending state. You will check your profile bookings to see the upcoming and completed events."
        }
    ];

    useEffect(() => {
        const fetchEvents = async () => {
            const { data } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: false })
                .limit(4);
            if (data) setEvents(data);
        };
        fetchEvents();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <motion.section
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="relative h-[600px] flex items-center justify-center text-white overflow-hidden"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/images/home.gif")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="container mx-auto px-4 z-10 text-center">
                    <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Promoting Youth Empowerment For Development
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200">
                        Connecting scholars, fostering innovation, and driving sustainable development in third-world countries.
                    </motion.p>
                    <motion.div variants={fadeInUp}>
                        <Link href="/onboard">
                            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 text-lg">
                                Become a Member
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* Content Body */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        className="mb-12 text-auto"
                    >
                        <h2 className="text-3xl font-bold text-primary mb-4 text-center">Who We Are: International Development Youth Foundation Services - idyfs.com</h2>
                        <div>
                            <p> International Development Youth Foundation Services is a non-profit organization that focuses on leveraging the power of technology to address global challenges. We aim to empower the next generation of leaders and innovators through education and training, and to provide opportunities for scholars to engage in research and development, and to contribute to the advancement of knowledge and innovation. Our influence is far reaching, and we are committed to making a positive impact in the world by empowering youths and non-profit organizations with the required knowledge and skills to create a better future for all. We hold regular events to connect scholars and to provide opportunities for scholars to engage in research and development, and to contribute to the advancement of knowledge and innovation.</p>
                        </div>
                    </motion.div>
                    <motion.section
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={staggerContainer}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                            {WHO_WE_ARE_SECTIONS.map((section, index) => (
                                <motion.div variants={fadeInUp} key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
                                    <h3 className="text-xl font-bold text-[#04047a] mb-4 text-center">{section.title}</h3>
                                    <div className="relative h-48 mb-6 overflow-hidden rounded-lg">
                                        <img
                                            src={section.image}
                                            alt={section.title}
                                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <p className="text-slate-600 leading-relaxed text-sm flex-grow">
                                        {section.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </section>
            {/* Past Events Gallery - Fixed Content */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-primary mb-4">Past Events Gallery</h2>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                            Explore highlights from our previous conferences, workshops, and community outreach programs. Our events are highly engaging and interactive, providing unique networking opportunities.</p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 mb-12"
                    >
                        {PAST_EVENTS.map((video, index) => (
                            <motion.div variants={fadeInUp} key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col">
                                <div className="relative pt-[56.25%] bg-black">
                                    <iframe
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                        src={video.src}
                                        title={video.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <div className="p-6 flex-1">
                                    <h3 className="text-xl font-semibold text-primary mb-2">{video.title}</h3>
                                    <p className="text-gray-600">{video.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="text-center">
                        <Link href="/events">
                            <Button variant="default" size="lg" className="bg-[#04047a]">View Upcoming Events</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-background text-gray-800">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Got questions? We've got answers to help you navigate your experience with IDYFS.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={staggerContainer}
                        className="space-y-4"
                    >
                        {FAQs.map((faq, index) => (
                            <motion.div variants={fadeInUp} key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full text-left px-6 py-4 bg-white hover:bg-slate-50 flex justify-between items-center focus:outline-none transition-colors"
                                >
                                    <span className="font-semibold text-primary text-lg">{faq.question}</span>
                                    <span className={`transform transition-transform duration-200 ${openFaq === index ? "rotate-180" : ""}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{ height: openFaq === index ? "auto" : 0, opacity: openFaq === index ? 1 : 0 }}
                                    className="overflow-hidden bg-slate-50"
                                >
                                    <div className="px-6 py-4 text-gray-600 leading-relaxed border-t border-gray-100">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-primary text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Join the Movement</h2>
                    <p className="mb-8 text-lg opacity-90 max-w-2xl mx-auto">Be part of a global network dedicated to change. Whether you are a student, researcher, or professional, there is a place for you.</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/onboard">
                            <Button size="lg" variant="secondary" className="font-semibold"> Get Started</Button>
                        </Link>
                        <Link href="/team">
                            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary"> Meet Our Team</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
