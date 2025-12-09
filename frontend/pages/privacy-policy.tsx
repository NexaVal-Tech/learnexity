import React from 'react';
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";

export default function PrivacyPolicy() {
    return (
        <AppLayout>
            <div className="min-h-screen bg-white">
                {/* Privacy Policy Header Banner */}
                <div className="bg-slate-900 max-w-[1000px] rounded-2xl mx-auto text-white py-8 px-4 sm:px-6 mt-30">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold mb-2">Privacy Policy</h1>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                                </p>
                                <p className="text-xs text-gray-400 mt-2">Last updated: November 30, 2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                    {/* Introduction */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Introduction</h2>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            Learnings respects your privacy. This Privacy Policy explains what personal information we collect, how we use it, with whom we share it, and your choices. This Policy applies to data collected through our website, courses, apps, community features, and related services and locations.
                        </p>
                    </section>

                    {/* Controller & Contact */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Controller & Contact</h2>
                        <div className="bg-gray-50 p-4 rounded space-y-1 text-sm">
                            <div>
                                <span className="font-semibold text-gray-900">Data Controller:</span>
                                <span className="text-gray-700"> Learnings</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Email:</span>
                                <a href="mailto:info@learnexiyt.org" className="text-blue-600 hover:underline"> info@learnexity.org</a>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Phone:</span>
                                <a href="tel:+1 (276) 252-8415" className="text-blue-600 hover:underline"> +1 (276) 252-8415</a>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Address:</span>
                                <span className="text-gray-700"> Chesapeake, Virginia</span>
                            </div>
                        </div>
                    </section>

                    {/* What We Collect */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">What We Collect</h2>
                        
                        <div className="space-y-4 text-sm">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">1) Information We Provide</h3>
                                <ul className="space-y-1 text-gray-700">
                                    <li>• <span className="font-medium">Account Information:</span> name, email, phone number, password</li>
                                    <li>• <span className="font-medium">Profile and biography:</span> education, work history, profile photo, bio</li>
                                    <li>• <span className="font-medium">Payment Information:</span> billing address, tax identifiers; we receive limited payment transaction data</li>
                                    <li>• <span className="font-medium">Course enrollments:</span> messages, forum posts, submissions, and course assignments</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">2) Automatically Collected Information</h3>
                                <ul className="space-y-1 text-gray-700">
                                    <li>• <span className="font-medium">Usage data:</span> page visited, course progress, session duration, IP address, device and browser type, cookies, analytics</li>
                                    <li>• <span className="font-medium">Technical data:</span> device information, operating system, referer URLs</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">3) Third-Party Sources</h3>
                                <p className="text-gray-700">
                                    We may receive info via social sign (Google, Facebook, etc.), or when shared by partners (employers, accrediting providers).
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Sensitive Data */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">3.4 Sensitive Data</h2>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <p className="text-sm text-gray-800">
                                We do not intentionally collect sensitive personal data (race, religion, health status, sex, citizenship, poverty). If you do not provide it or you wish selected content or as required by law.
                            </p>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">How We Use Your Information</h2>
                        <p className="text-sm text-gray-700 mb-2">We use data to:</p>
                        <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Create your account, provide courses and learning activities, recommendations, dashboards</li>
                            <li>• Process payments and handle billing</li>
                            <li>• Communicate updates, support, and marketing (with opt-out)</li>
                            <li>• Improve our products using analytics and research</li>
                            <li>• Enable community features and mentor interactions</li>
                            <li>• Provide certificates, test results, credentials and participation</li>
                            <li>• Comply with legal obligations and enforce policies</li>
                        </ul>
                    </section>

                    {/* Legal Bases for Processing */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Legal Bases for Processing (EEA/UK)</h2>
                        <p className="text-sm text-gray-700">
                            If you are in the EEA/UK, our legal bases include: performance of a contract, consent, legitimate interests (i.e., security, product improvement), and compliance with legal obligations.
                        </p>
                    </section>

                    {/* Sharing and Disclosure */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Sharing and Disclosure</h2>
                        <p className="text-sm text-gray-700 mb-3">We may share information with:</p>
                        
                        <div className="space-y-3">
                            <div className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2">
                                <h3 className="text-sm font-semibold text-gray-900">Service Providers</h3>
                                <p className="text-sm text-gray-700">Payment processors, hosting providers, analytics, email delivery, and support platforms</p>
                            </div>

                            <div className="border-l-4 border-green-500 bg-green-50 pl-4 py-2">
                                <h3 className="text-sm font-semibold text-gray-900">Partners and Employers</h3>
                                <p className="text-sm text-gray-700">Only with your explicit consent (e.g., for placements or scholarship applications)</p>
                            </div>

                            <div className="border-l-4 border-red-500 bg-red-50 pl-4 py-2">
                                <h3 className="text-sm font-semibold text-gray-900">Legal and Safety</h3>
                                <p className="text-sm text-gray-700">To comply with a subpoena, rights, safety or property</p>
                            </div>

                            <div className="border-l-4 border-purple-500 bg-purple-50 pl-4 py-2">
                                <h3 className="text-sm font-semibold text-gray-900">Business Transfers</h3>
                                <p className="text-sm text-gray-700">In connection with mergers, acquisitions, or asset sales, with notice to users</p>
                            </div>
                        </div>
                    </section>

                    {/* Cookies & Tracking */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Cookies & Tracking Technologies</h2>
                        <p className="text-sm text-gray-700">
                            We use cookies and similar technologies for operation, analytics, personalization, and advertising. You can control cookies via your browser settings (see work). Rejecting may limit functionality and cookies.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Data Retention</h2>
                        <p className="text-sm text-gray-700">
                            We retain personal data for as long as necessary to provide Services, comply with legal obligations, resolve disputes, and enforce our agreements. Retention periods vary for data type.
                        </p>
                    </section>

                    {/* Security */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Security</h2>
                        <p className="text-sm text-gray-700">
                            We implement administrative, technical, and physical safeguards designed to protect personal data. While we use reasonable measures, no system is completely secure; report suspected breaches to <a href="mailto:info@thefinlawyers.com" className="text-blue-600 hover:underline">info@thefinlawyers.com</a>
                        </p>
                    </section>

                    {/* International Transfers */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">International Transfers</h2>
                        <p className="text-sm text-gray-700">
                            Learnings may transfer data to countries outside your jurisdiction (including the U.S.). When required, we use safeguards (e.g., data protection clauses or rely on adequacy decisions). Contact us for details.
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Your Rights</h2>
                        <p className="text-sm text-gray-700 mb-3">Depending on your jurisdiction, you may have rights including:</p>
                        
                        <div className="space-y-2 text-sm bg-gray-50 p-4 rounded">
                            <div>
                                <span className="font-semibold text-gray-900">Access and portability</span>
                                <span className="text-gray-700"> — Request a copy of personal data</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Correction</span>
                                <span className="text-gray-700"> — Request correction of inaccurate data</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Deletion</span>
                                <span className="text-gray-700"> — Request erasure of data (subject to exceptions)</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Restriction or objection to processing</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Withdraw consent</span>
                                <span className="text-gray-700"> — where processing is based on consent</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">Lodge a complaint</span>
                                <span className="text-gray-700"> with your local data protection authority</span>
                            </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-700">
                            We may require verification and will respond within applicable legal timeframes. To exercise rights, contact <a href="mailto:info@thefinlawyers.com" className="text-blue-600 hover:underline">info@thefinlawyers.com</a>
                        </div>
                    </section>

                    {/* Children's Privacy */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Children's Privacy</h2>
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                            <p className="text-sm text-gray-800">
                                The Services are not directed to children under 16 or higher minimum age where required. If we learn we collected personal data from a child without parental consent, we will delete it. Parents/guardians may contact us to request a learning opportunity.
                            </p>
                        </div>
                    </section>

                    {/* Marketing Communications */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Marketing Communications</h2>
                        <p className="text-sm text-gray-700">
                            We may send promotional emails if you opt-in. You can unsubscribe via links in emails or by contacting <a href="mailto:info@thefinlawyers.com" className="text-blue-600 hover:underline">info@thefinlawyers.com</a>
                        </p>
                    </section>

                    {/* Third-Party Links & Integrations */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Third-Party Links & Integrations</h2>
                        <p className="text-sm text-gray-700">
                            Our Services may link to third-party sites and integrate third-party tools. This Privacy Policy does not apply to third-party practices, so see their own respective policies as they are varying term.
                        </p>
                    </section>

                    {/* Changes to this Policy */}
                    <section className="mb-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Changes to this Policy</h2>
                        <p className="text-sm text-gray-700">
                            We may update this Privacy Policy. We will post the revised policy with the "Last updated" date. Significant changes will be communicated by email or prominent site notice.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-8">
                        <h2 className="text-base font-bold text-gray-900 mb-3">Contact</h2>
                        <p className="text-sm text-gray-700 mb-4">For questions, requests, or concerns regarding this Privacy Policy or your data:</p>
                        
                        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-1 text-sm">
                            <div>
                                <span className="font-medium">Email:</span>
                                <a href="mailto:info@learnexity.org" className="text-blue-300 hover:underline ml-1">info@learnexity.org</a>
                            </div>
                            <div>
                                <span className="font-medium">Phone:</span>
                                <a href="tel:+1 (276) 252-8415" className="text-blue-300 hover:underline ml-1">+1 (276) 252-8415</a>
                            </div>
                            <div>
                                <span className="font-medium">Address:</span>
                            </div>
                            <div className="pl-0">Learnexity</div>
                            <div className="pl-0">Chesapeake, Virginia</div>
                            <div className="pl-0">United States</div>
                        </div>
                    </section>

                    {/* Footer Note */}
                    <div className="text-center py-4 border-t">
                        <p className="text-xs text-gray-500">
                            By using Learnings, you acknowledge that you have read and understand this Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </AppLayout>
    );
}