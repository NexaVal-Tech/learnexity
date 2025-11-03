import {
  ScrollFadeIn,
  FadeInCard,
  FadeUpOnScroll,
  ZoomAnimation,
} from "../animations/Animation";

import Image from "next/image";

export default function CurriculumPartners() {
  const partners = [
    { name: "Microsoft", logo: "/partners/microsoft.png", className: "h-8" },
    { name: "Google Cloud", logo: "/partners/google.png", className: "h-8" },
    { name: "AWS", logo: "/partners/aws.png", className: "h-8" },
    { name: "Cisco", logo: "/partners/cisco.png", className: "h-8" },
    { name: "IBM", logo: "/partners/IBM.png", className: "h-8" },
    { name: "Oracle", logo: "/partners/oracle.png", className: "h-8" },
    { name: "Udacity", logo: "/partners/udacity.png", className: "h-8" },
    { name: "edX", logo: "/partners/edx.png", className: "h-8" },
    { name: "CompTIA", logo: "/partners/comptia.png", className: "h-8" },
    { name: "Coursera", logo: "/partners/coursera.png", className: "h-8" },
  ];

  return (
   
    <section className="py-10 bg-white">
       <FadeUpOnScroll>
        <div className="max-w-screen-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-4xl font-semibold text-gray-900 mb-8 leading-tight">
            Our curriculum is designed to align with global<br /> tech leaders like:
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-8">
            {partners.map((partner) => (
              <div key={partner.name} className="flex items-center justify-center hover:shadow-md transition-shadow duration-200 min-w-[80px] h-16">
                <Image src={partner.logo} alt={`${partner.name} logo`} width={80} height={30}
                  className="object-contain opacity-70 hover:opacity-100 transition-opacity duration-200"
                />
              </div>
            ))}
          </div>
        </div>
      </FadeUpOnScroll>
    </section>
  );
}
