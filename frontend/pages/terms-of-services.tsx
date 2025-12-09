import React, { useState } from 'react';
import Footer from '@/components/footer/Footer';

export default function TermsOfServices() {
    const [isTocOpen, setIsTocOpen] = useState(false);

    const tocItems = [
        { id: "introduction", label: "Introduction" },
        { id: "acceptance", label: "Acceptance and Changes" },
        { id: "eligibility", label: "Eligibility" },
        { id: "accounts", label: "Accounts, Registration & Security" },
        { id: "services", label: "Services, Courses & Subscriptions" },
        { id: "payments", label: "Payments, Billing & Refunds" },
        { id: "intellectual", label: "Intellectual Property" },
        { id: "user-content", label: "User Conduct & Moderation" },
        { id: "third-party", label: "Third-Party Sales & Services" },
        { id: "disclaimers", label: "Disclaimers & No Guarantees" },
        { id: "limitation", label: "Limitation of Liability" },
        { id: "indemnification", label: "Indemnification" },
        { id: "termination", label: "Termination" },
        { id: "governing", label: "Governing Law & Dispute Resolution" },
        { id: "changes", label: "Changes to the Services" },
        { id: "miscellaneous", label: "Miscellaneous" }
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsTocOpen(false);
        }
    };


    return(
        <div className="min-h-screen bg-white">
            {/* Mobile TOC Toggle Button - Fixed at bottom on mobile */}
            <button
                onClick={() => setIsTocOpen(!isTocOpen)}
                className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile TOC Overlay */}
            {isTocOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsTocOpen(false)}
                >
                    <div 
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                Table of Contents
                            </h2>
                            <button onClick={() => setIsTocOpen(false)}>
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="h-px bg-gray-300 mb-4"></div>
                        <ul className="space-y-3">
                            {tocItems.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => scrollToSection(item.id)}
                                        className="text-blue-600 hover:underline text-left w-full"
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-22 sm:py-12 lg:py-30">
                {/* Two Column Layout */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Table of Contents - Left Sidebar (Desktop only) */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24 p-6 border-2 rounded-2xl">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                Table of Contents
                            </h2>
                            <div className="h-px bg-gray-300 mb-4"></div>
                            <ul className="space-y-2 text-sm">
                                {tocItems.map((item) => (
                                    <li key={item.id}>
                                        <a href={`#${item.id}`} className="text-blue-600 hover:underline">
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Content Sections - Right Side */}
                    <div className="flex-1 prose prose-blue max-w-none border-2 rounded-2xl px-4 sm:px-6 py-6">
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 bg-gray-200 rounded-full p-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms of Service</h1>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">Last updated: November 30, 2024</p>
                        </div>

                        <div className="h-px bg-gray-300 mb-6"></div>

                        <section id="introduction" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                These Terms of Service ("Terms") govern your access to and use of the educational materials, services, course materials, community features, and related products (the "Services") provided by us/company by accessing or using the Services, you agree to be bound by these Terms. If you do not agree, do not use the Services.
                            </p>
                        </section>

                        <section id="acceptance" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">2. Acceptance and Changes</h2>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">2.1 Acceptance</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                By creating an account, buying the Services, creating or posting content, you accept these Terms and agree to be bound by them.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">2.2 Changes</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                We may modify these Terms from time to time. We will post any updated Terms on our site with the "Last Updated" date. Continued use after changes constitutes acceptance.
                            </p>
                        </section>

                        <section id="eligibility" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                You must be at least 18 years old or meet the minimum age required in your jurisdiction to use the Services. If you are under 18, you must have parental or legal guardian consent. By creating an account, you confirm you meet these requirements.
                            </p>
                        </section>

                        <section id="accounts" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">4. Accounts, Registration & Security</h2>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">4.1 Account Creation</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                To access certain features, you must register and provide accurate information. You are accountable for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">4.2 Security</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                Notify us immediately of any unauthorized use or security breach via <a href="mailto:info@learnexity.org" className="text-blue-600 hover:underline break-all">info@learnexity.org</a>
                            </p>
                        </section>

                        <section id="services" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">5. Services, Courses & Subscriptions</h2>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">5.1 Course Access</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                Courses may be offered as one-time purchases, subscriptions, or cohort-based programs. Access details, duration, included materials, restrictions, assessments will be described in the applicable course page.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">5.2 Availability</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                We reserve the right to withdraw courses, courses support, or community features. Availability, scheduling, and content are subject to change.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">5.3 Community</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                Some courses include community access. Discord, forums are intended for peer learning and professional networking. Please conduct yourself respectfully and in accordance with our codes of conduct policy.
                            </p>
                        </section>

                        <section id="payments" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">6. Payments, Billing & Refunds</h2>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">6.1 Payments</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                Fees are due at specified at purchase. We accept payment methods displayed at checkout. All fees are in the currency displayed.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">6.2 Subscriptions</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                Subscriptions may auto-renew until canceled. You authorize us to charge the payment method on file. You may cancel anytime; cancellation typically takes effect at the end of the billing cycle.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">6.3 Refunds</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                Our Refund Policy governs eligibility for refunds. See the Refund Policy on our website for details.
                            </p>
                        </section>

                        <section id="intellectual" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">7.1 Our Rights</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                All content provided via Services (courses, materials, video, code, designs, logos, trademarks or conduct text, images, graphics) is owned or licensed by us and protected by copyright and other intellectual property laws. You may not copy, distribute, reproduce, publish, modify, or resell licensed works without our prior written consent.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">7.2 Limited License</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                By enrolling, you gain a worldwide, non-exclusive, non-transferable right to access and use course content for your personal, non-commercial educational purposes solely. You may not reproduce, redistribute, resell, modify, or create derivative works without written consent.
                            </p>
                        </section>

                        <section id="user-content" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">8. User Conduct & Moderation</h2>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">8.1 Prohibited Conduct</h3>
                            <ul className="list-disc pl-5 sm:pl-6 space-y-1 text-sm sm:text-base text-gray-700 mb-4">
                                <li>Violent content</li>
                                <li>Copyright infringement</li>
                                <li>Cheating</li>
                                <li>Harassment</li>
                                <li>Impersonation</li>
                                <li>Spam or fraud</li>
                                <li>Reverse engineering</li>
                                <li>Disrupting Services</li>
                                <li>Unauthorized access</li>
                            </ul>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                We may suspend or terminate accounts that violate these terms or our community policies.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 mt-4">8.2 Moderation</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                We may moderate, remove, or refuse content that violates these Terms or community guidelines.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">8.3 Reviews and Testimonials</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                By posting reviews, you represent that they are truthful and not misleading.
                            </p>
                        </section>

                        <section id="third-party" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">9. Third-Party Sales & Services</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                The Services may include links or integrations to third-party websites, tools, or services. We are not responsible for third-party content, practices or privacy policies.
                            </p>
                        </section>

                        <section id="disclaimers" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">10. Disclaimers & No Guarantees</h2>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">10.1 Educational Nature</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                Learnings provide educational and informational support but do not guarantee job placement, employment, certification, or professional achievement.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">10.2 As-Is Services</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                To the fullest extent permitted by law, the Services are provided "as is" and "as available." We disclaim all warranties, express or implied.
                            </p>
                        </section>

                        <section id="limitation" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                To the maximum extent permitted by law, Learnings and its affiliates will not be liable for indirect, incidental, special, consequential, or punitive damages (including loss of use, data, business or profits) arising from or related to these Terms or your use of the Services. In no event shall our total liability for all claims relating to the Services exceed the amount paid by you to us in the 12 months preceding the claim (or USD $50.00 if you paid nothing), except where prohibited by law.
                            </p>
                        </section>

                        <section id="indemnification" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                You agree to indemnify, defend, and hold harmless Learnings and its officers, directors, employees, and agents from any claims, liabilities, damages, and expenses arising from your violation of these Terms, your misuse of the Services, or your violation of any law or the rights of third parties.
                            </p>
                        </section>

                        <section id="termination" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">13.1 By You</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                You may close your account at any time by contacting us or by using the Services.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">13.2 By Us</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                We may suspend or terminate accounts for violations of these Terms, fraud, or conduct that we deem contrary to our business interests.
                            </p>
                        </section>

                        <section id="governing" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">14. Governing Law & Dispute Resolution</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                These Terms are governed by the laws of Virginia, United States of America. Any disputes will be resolved in the courts of Virginia, United States of America except where otherwise required by applicable law. By using the Services, you irrevocably consent to the exclusive jurisdiction of those courts.
                            </p>
                        </section>

                        <section id="changes" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">15. Changes to the Services</h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                We may modify, limit, or discontinue features or Services at any time. We will attempt to provide notice for material changes.
                            </p>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                Our Privacy Policy explains how we collect, use and share personal data. By using the Services you consent to our data practices as set forth in the Privacy Policy.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">15.1 Contact</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                For questions, concerns, or to exercise rights, contact:
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs sm:text-sm text-gray-700">Email: </span>
                                    </div>
                                    <a href="mailto:info@learnexity.org" className="text-xs sm:text-sm text-blue-600 hover:underline break-all">info@learnexity.org</a>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className="text-xs sm:text-sm text-gray-700">Phone: </span>
                                    </div>
                                    <a href="tel:+1 (276) 252-8415" className="text-xs sm:text-sm text-blue-600 hover:underline">+1 (276) 252-8415</a>
                                </div>
                            </div>
                        </section>

                        <section id="miscellaneous" className="mb-8 scroll-mt-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">16. Miscellaneous</h2>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">16.1 Entire Agreement</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                These Terms and any referenced policies constitute the entire agreement between you and Learnings regarding the Services.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">16.2 Severability</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                If any condition is unenforceable, the remaining provisions remain in effect.
                            </p>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">16.3 Assignment</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                Learnings may assign its rights or obligations without your consent; you may not assign without our written consent.
                            </p>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic mt-8">
                                By using Learnings, you acknowledge that you have read, understand, and agree to be bound by these Terms of Service.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

             <Footer />
        </div>
    )
}
