
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Services() {
    const services = [
        {
            title: "Certification Generation",
            image: "/images/service1.jpeg",
            description: "Train youths on development and financial growth and issue recognition certification.",
            details: "Our certification programs are designed to validate skills and enhance employability in the global market."
        },
        {
            title: "Fellowship Programs",
            image: "/images/service2.jpeg",
            description: "Leading and guiding in fellowship and conference programs.",
            details: "Funding and support for individuals to pursue research, professional development, or training opportunities in specific fields. Available for PhD students and researchers."
        },
        {
            title: "Training and Mentorship",
            image: "/images/service3.jpeg",
            description: "Mentorship on various topics including leadership and financial literacy.",
            details: "We connect aspiring leaders with experienced mentors to guide their personal and professional growth."
        },
        {
            title: "Conference Programs",
            image: "/images/service4.jpeg",
            description: "Organizing and facilitating academic and professional conferences.",
            details: "Platforms for knowledge exchange, networking, and collaboration among scholars and professionals."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section
                className="relative h-[400px] flex items-center justify-center text-white"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/images/services.gif")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="container mx-auto px-4 z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
                    <p className="text-xl max-w-2xl mx-auto text-gray-200">
                        Empowering individuals and organizations through education, training, and strategic support.
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {services.map((service, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow border-t-4 border-t-primary overflow-hidden">
                                <CardHeader>
                                    <div className="mb-4 aspect-video w-full overflow-hidden rounded-md">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <CardTitle className="text-xl text-primary">{service.title}</CardTitle>
                                    <CardDescription className="text-base mt-2">{service.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {service.details}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-16 bg-slate-50 p-8 rounded-xl border border-slate-200">
                        <h3 className="text-2xl font-bold text-primary mb-4 text-center">About Our Fellowship Programs</h3>
                        <img src="/images/team.png" alt="Fellowship Programs" className="w-full h-64 object-cover mb-6 rounded-lg shadow-sm" />
                        <div className="max-w-4xl mx-auto space-y-4 text-gray-700">
                            <p>  A fellowship program provides funding and support for individuals to pursue research professional development or training opportunities in a specific field. These programs can be offered by universities, research institutions, government agencies, or non-profit organizations. </p>
                            <p> Fellowships can be prestigious and offer unique opportunities for individuals to advance their careers and contribute to their fields. We are committed to making these opportunities accessible to talented youth in developing regions. </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
