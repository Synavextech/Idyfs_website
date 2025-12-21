
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function About() {
    const teamMembers = [
        {
            name: "Founder",
            role: "Founder",
            image: "/images/t6-founder.png",
            bio: "Visionary leader dedicated to youth empowerment."
        },
        {
            name: "Director",
            role: "Director",
            image: "/images/t2-director.png",
            bio: "Strategic oversight of organizational goals."
        },
        {
            name: "Program Director",
            role: "Program Director",
            image: "/images/t3-program_director.png",
            bio: "Managing impactful youth programs."
        },
        {
            name: "Regional Manager",
            role: "Regional Manager",
            image: "/images/t5-regional manager.png",
            bio: "Coordinating operations across regions."
        },
        {
            name: "Event Planner",
            role: "Event Planner",
            image: "/images/t4-event_planer.png",
            bio: "Organizing memorable events and workshops."
        },
        {
            name: "Mentor",
            role: "Mentor",
            image: "/images/t1 - mentor.png",
            bio: "Guiding youth through personal development."
        },
        {
            name: "Mentor",
            role: "Mentor",
            image: "/images/t8-mentor.jpeg",
            bio: "Supporting skill acquisition and growth."
        },
        {
            name: "Mentor",
            role: "Mentor",
            image: "/images/t9-mentor.jpeg",
            bio: "Empowering the next generation of leaders."
        }
    ];

    const partners = [
        "/images/partner.jpeg",
        "/images/partner.png",
        "/images/partner2.jpeg",
        "/images/partner1.jpeg"
    ];

    const focusAreas = [
        {
            title: "Personal Development coaching",
            image: "/images/service2.jpeg",
            content: "We offer educational resources, vocational training, and workshops to equip young people with the skills and knowledge they need to competitively build their communities."
        },
        {
            title: "Leadership Development coaching",
            image: "/images/service3.jpeg",
            content: "We foster leadership skills, empowering young people to actively participate in their communities and to advocate for their own rights and interests."
        },
        {
            title: "Social Support & Resilience coaching",
            image: "/images/partner.png",
            content: "We provide counseling, mentoring, and social support to help young people cope with work challenges and build personal resilience."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section
                className="relative h-[400px] flex items-center justify-center text-white"
                style={{
                    backgroundColor: '#04047a',
                    backgroundImage: 'linear-gradient(rgba(4, 4, 122, 0.8), rgba(4, 4, 122, 0.8)), url("/images/youth.jpeg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="container mx-auto px-4 z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Team & Mission</h1>
                    <p className="text-xl max-w-3xl mx-auto text-gray-200"> Developing and harnessing unique ideas, talents, and abilities for success in education, entrepreneurship, innovation, and employment.
                    </p>
                </div>
            </section>

            {/* Mission Content */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto mb-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                            <div>
                                <h2 className="text-3xl font-bold text-primary mb-6">About IDYFS & Youth Empowerment</h2>
                                <p className="text-lg text-gray-700 leading-relaxed mb-6">International Development Youth Foundation Services (IDYFS) is a Pan-African Non-governmental organization helping Young men and women, between 15 and 35 years. We train, mentor and empower youth with digital, leadership, employability and entrepreneurial skills for self-sustenance and professional growth.</p>
                                <p className="text-lg text-gray-700 leading-relaxed">Our holistic approach ensures that young people are not only equipped with technical skills but also the soft skills and resilience needed to navigate the modern world.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <img src="/images/blog.gif" alt="IDYFS Activity" className="rounded-lg shadow-md w-full h-48 object-cover" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {focusAreas.map((area, idx) => (
                                <Card key={idx} className="bg-slate-50 border-none shadow-sm h-full hover:shadow-md transition-shadow overflow-hidden">
                                    <div className="h-48 overflow-hidden">
                                        {area.image && (
                                            <img
                                                src={area.image}
                                                alt={area.title}
                                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                            />
                                        )}
                                    </div>
                                    <CardContent className="pt-6">
                                        <h3 className="font-semibold text-primary mb-2">{area.title}</h3>
                                        <p className="text-sm text-gray-600">{area.content}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Team Gallery */}
                    <div className="mt-20">
                        <h2 className="text-3xl font-bold text-primary mb-12 text-center">Meet Our Team</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="flex flex-col items-center text-center group">
                                    <div className="w-48 h-48 rounded-full overflow-hidden mb-4 border-4 border-slate-100 group-hover:border-accent transition-colors">
                                        <Avatar className="w-full h-full">
                                            <AvatarImage src={member.image} alt={member.name} className="object-cover" />
                                            <AvatarFallback className="bg-primary text-white text-xl">
                                                {member.role.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                                    <span className="text-accent font-medium mb-2 block">{member.role}</span>
                                    <p className="text-sm text-gray-500 max-w-xs">{member.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Partners Section */}
                    <div className="mt-24 mb-16">
                        <h2 className="text-3xl font-bold text-primary mb-12 text-center">Our Partners</h2>
                        <div className="flex flex-wrap justify-center gap-12 items-center">
                            {partners.map((partnerImage, index) => (
                                <div key={index} className="w-80 h-48 flex items-center justify-center">
                                    <img src={partnerImage} alt={`Partner ${index + 1}`} className="max-w-full max-h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Join Us CTA */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-primary mb-4">Join Our Mission</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        We are always looking for new associates, partners, and volunteers to help us make a difference.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                            <a href="/contact">Contact Us</a>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <a href="/auth">Become a Member</a>
                        </Button>
                    </div>
                </div>
            </section>

        </div>
    );
}
