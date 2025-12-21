
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Event } from "@shared/schema";

const PAST_EVENTS = [
    {
        src: "/images/idys.mp4",
        title: "Global Youth Summit 2022",
        description: "Highlights from our annual summit focusing on sustainable development goals and youth leadership."
    },
    {
        src: "/images/idys2.mp4",
        title: "Tech for Good Workshop",
        description: "Empowering young developers to build digital solutions for their local communities."
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

export default function Landing() {
    const [events, setEvents] = useState<Event[]>([]);

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
            <section
                className="relative h-[600px] flex items-center justify-center text-white overflow-hidden"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/images/home.gif")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="container mx-auto px-4 z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Promoting Youth Empowerment For Development
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200">
                        Connecting scholars, fostering innovation, and driving sustainable development in third-world countries.
                    </p>
                    <Link href="/onboard">
                        <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 text-lg">
                            Become a Member
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Content Body */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-auto">
                        <h2 className="text-3xl font-bold text-primary mb-4 text-center">Who We Are</h2>
                        <div>
                            <p> International Development Youth Foundation Services is a non profit organization that focuses on leveraging the power of technology to address global challenges. We aim to empower the next generation of leaders and innovators through education and training, and to provide opportunities for scholars to engage in research and development, and to contribute to the advancement of knowledge and innovation. our influence is far reaching and we are committed to making a positive impact in the world by empowering youths and non-profit organizations with the required knowledge and skills to create a better future for all. we hold regular events to connect scholars and to provide opportunities for scholars to engage in research and development, and to contribute to the advancement of knowledge and innovation.</p>
                        </div>
                    </div>
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                            {WHO_WE_ARE_SECTIONS.map((section, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
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
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </section>
            {/* Past Events Gallery - Fixed Content */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-primary mb-4">Past Events Gallery</h2>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                            Explore highlights from our previous conferences, workshops, and community outreach programs. Our events are highly engaging and interactive, providing unique networking opportunities.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {PAST_EVENTS.map((video, index) => (
                            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col">
                                <div className="relative pt-[56.25%] bg-black">
                                    <video
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                        src={video.src}
                                        controls
                                        muted
                                        loop
                                        playsInline
                                    > Your browser does not support the video tag.
                                    </video>
                                </div>
                                <div className="p-6 flex-1">
                                    <h3 className="text-xl font-semibold text-primary mb-2">{video.title}</h3>
                                    <p className="text-gray-600">{video.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link href="/events">
                            <Button variant="default" size="lg" className="bg-[#04047a]">View Upcoming Events</Button>
                        </Link>
                    </div>
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
