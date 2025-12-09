import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-gray-900 text-white py-6 px-6 mt-30">
        <div className=" mx-auto">
          <h1 className="text-3xl font-bold mb-4">Refund Policy</h1>
          <p className="text-gray-300 mb-2">
            Learnexity wants you to be confident in your learning investment. This policy outlines eligibility requirements, timelines, and procedures for requesting refunds.
          </p>
          <p className="text-sm text-gray-400">Last Updated: November 19, 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* 1. Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl text-gray-800 font-bold mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Learnexity wants you to be confident in your learning investment. This Refund Policy outlines eligibility requirements, timelines, and procedures for requesting refunds on course purchases and subscriptions. By purchasing any Learnexity product or service, you agree to the terms outlined in this policy.
          </p>
        </section>

        {/* 2. Refund Eligibility Period */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">2. Refund Eligibility Period</h2>
          
          {/* 2.1 Standard Refund Window */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">2.1 Standard Refund Window</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-gray-800 mb-2">
                    All refund requests must be submitted within <strong>4 weeks (28 days)</strong> of the initial payment date. After 28 days from your payment, refunds will not be processed under any circumstances except as outlined in Section 2.3 (Extraordinary Circumstances).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2.2 Eligibility Requirements */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">2.2 Eligibility Requirements</h3>
            <p className="text-gray-700 mb-4">
              To qualify for a refund within the 4-week window, you must meet <strong>ALL</strong> of the following criteria:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Refund request submitted no later than 28 days after payment date</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Course completion does not exceed 25% of total content</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>No course certificates, completion badges, or credentials have been downloaded or issued</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>All course materials (videos, downloadable resources, templates) remain undownloaded</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>No violations of our Terms of Service or Community Guidelines</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Account is in good standing with no outstanding payments or chargebacks</span>
              </li>
            </ul>
          </div>

          {/* 2.3 Extraordinary Circumstances */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">2.3 Extraordinary Circumstances</h3>
            <p className="text-gray-700 mb-4">
              Refund requests submitted after the 4-week window may be considered only in the following exceptional cases:
            </p>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Platform-Initiated Course Cancellation</h4>
                <ul className="text-gray-700 text-sm space-y-1 ml-4">
                  <li>• If Learnexity cancels or discontinues a course entirely</li>
                  <li>• Full automatic refund processed within 5 business days</li>
                  <li>• OR option to transfer enrollment to an equivalent course</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Documented Medical Emergency</h4>
                <ul className="text-gray-700 text-sm space-y-1 ml-4">
                  <li>• Requires official medical documentation from a licensed physician</li>
                  <li>• Must demonstrate inability to access the platform for an extended period at most one week</li>
                  <li>• Reviewed on case-by-case basis by our support team</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Verified Technical Failures</h4>
                <ul className="text-gray-700 text-sm space-y-1 ml-4">
                  <li>• Platform-wide outages preventing course access for 14+ consecutive days</li>
                  <li>• Must be reported within 48 hours of occurrence</li>
                  <li>• Support team verification required</li>
                  <li>• Does not apply to personal internet connectivity or device issues</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Death of Student</h4>
                <ul className="text-gray-700 text-sm space-y-1 ml-4">
                  <li>• Requires official death certificate</li>
                  <li>• Request must come from legal next of kin or estate representative</li>
                  <li>• Proper identification and documentation required</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-gray-800 text-sm">
                  All extraordinary circumstance requests require supporting documentation and are reviewed individually. Final approval is at Learnexity's sole discretion and may take up to 10 business days.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Refund Amounts and Deductions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">3. Refund Amounts and Deductions</h2>
          
          {/* 3.1 Full Refund */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">3.1 Full Refund (100% of payment)</h3>
            <p className="font-semibold text-gray-800 mb-3">Eligible if:</p>
            <ul className="space-y-2 ml-4 mb-4">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Request submitted within first 7 days of payment date</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Course completion is between 0-5% of total content</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>No course materials accessed, viewed, or downloaded</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>No interaction with community features (Discord, forums, mentor sessions)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>No live class sessions attended</span>
              </li>
            </ul>
            <p className="text-gray-700">
              <strong>Refund Calculation:</strong> Full payment amount MINUS non-refundable payment processing fees (2.5% of transaction value)
            </p>
          </div>

          {/* 3.2 Partial Refund */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">3.2 Partial Refund (50% of payment)</h3>
            <p className="font-semibold text-gray-800 mb-3">Eligible if:</p>
            <ul className="space-y-2 ml-4 mb-4">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Request submitted between days 15-28 after payment date</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Course completion is between 11-24% of total content</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Course materials accessed but not downloaded</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Minimal community participation (fewer than 3 posts or interactions)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Attended no more than 1 live class session</span>
              </li>
            </ul>
            <p className="text-gray-700">
              <strong>Refund Calculation:</strong> 50% of payment amount MINUS non-refundable payment processing fees
            </p>
          </div>

          {/* 3.3 No Refund */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">3.3 No Refund (0%)</h3>
            <p className="font-semibold text-gray-800 mb-3">Applies when:</p>
            <ul className="space-y-2 ml-4">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Request submitted after 28-day period</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Course completion exceeds 25% of content</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Certificates, badges, or credentials downloaded or issued</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Extensive course material downloads</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Active community participation or multiple mentor interactions</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Multiple live class sessions attended</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Previous refund history on account (abuse prevention)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Terms of Service violations documented on account</span>
              </li>
            </ul>
          </div>

          {/* 3.4 Non-Refundable Fees */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">3.4 Non-Refundable Fees and Charges</h3>
            <p className="text-gray-700 mb-3">The following are <strong>never refundable</strong> under any circumstances:</p>
            <ul className="space-y-2 ml-4">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Payment processing fees (2.5% of transaction value)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Platform transaction fees</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Currency conversion fees for international payments</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Third-party payment gateway charges</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Bank transfer or wire fees</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Add-on services (career coaching packages, additional mentorship hours)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Community access fees (if purchased separately)</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Payment Plans and Installments */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">4. Payment Plans and Installments</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">4.1 Refund Eligibility for Payment Plans</h3>
            <p className="text-gray-700 mb-3">Students enrolled in payment plan options may request refunds if:</p>
            <ul className="space-y-2 ml-4">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Request submitted within 4 weeks of FIRST installment payment</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>All scheduled payments are current with no overdue amounts</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>No payment defaults, chargebacks, or failed transactions on record</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Course completion does not exceed 25% of total content</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>All eligibility criteria in Section 2.2 met</span>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">4.2 Payment Plan Refund Calculation</h3>
            <p className="text-gray-700 mb-3">Refund amount determined by:</p>
            <ul className="space-y-2 ml-4">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Total amount paid to date (sum of all completed installments)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Current course completion percentage</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Time elapsed since first payment</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Remaining scheduled payments are automatically canceled upon refund approval</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>No penalties assessed for early termination if refund approved</span>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">4.3 Payment Plan Restrictions</h3>
            <p className="text-gray-700 mb-3">Refunds NOT available if:</p>
            <ul className="space-y-2 ml-4 mb-4">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Any payment is overdue by 7 or more days</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Payment plan has been defaulted or placed in collections</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Chargeback initiated through bank or credit card company</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Account suspended due to non-payment</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>More than 2 failed payment attempts recorded</span>
              </li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-gray-800 text-sm font-semibold">Important:</p>
              <p className="text-gray-700 text-sm">
                You must submit a refund request BEFORE your next scheduled payment date. Refund processing may take 5-14 business days; you remain responsible for any payments that process during this period.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Promotional, Discounted, and Sponsored Purchases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">5. Promotional, Discounted, and Sponsored Purchases</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">5.1 Promotional Period Purchases</h3>
            <p className="text-gray-700 mb-3">
              Courses purchased during promotional periods (Black Friday, Cyber Monday, seasonal sales, flash discounts, early-bird pricing) ARE eligible for refunds within the standard 4-week window with the following conditions:
            </p>
            <ul className="space-y-2 ml-4 mb-4">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>All standard eligibility requirements in Section 2.2 apply</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Refund calculated based on actual discounted price paid, not original course price</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Same completion percentage limits apply (25% maximum)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Must meet all timeline requirements</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Promotional purchases eligible ONLY for cash refund (not course credits)</span>
              </li>
            </ul>
            
            <p className="font-semibold text-gray-800 mb-2">Special Exceptions:</p>
            <p className="text-gray-700 mb-2">Promotional purchases may be refunded outside normal circumstances only if:</p>
            <ul className="space-y-2 ml-4">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Verified technical issues prevented course access from day of purchase</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Course content significantly and materially misrepresented in marketing materials</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Platform-wide outage prevented access for 7+ consecutive days from enrollment date</span>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">5.2 Scholarship and Sponsored Students</h3>
            
            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="font-semibold text-gray-800 mb-2">Scholarship Recipients:</p>
                <ul className="space-y-1 ml-4 text-sm">
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>NOT eligible for cash refunds under any circumstances</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>May request course transfer to different program (subject to scholarship terms)</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Contact <a href="mailto:scholarships@learnexity.com" className="text-blue-600 hover:underline">scholarships@learnexity.com</a> for transfer inquiries</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Scholarship funds cannot be converted to cash or credits</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-semibold text-gray-800 mb-2">Corporate-Sponsored Enrollments:</p>
                <ul className="space-y-1 ml-4 text-sm">
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Must contact corporate sponsor directly for refund requests</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Refunds processed according to corporate partnership agreement terms</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Contact <a href="mailto:corporate@learnexity.com" className="text-blue-600 hover:underline">corporate@learnexity.com</a> with sponsor company name and details</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Individual students cannot request refunds for corporate-sponsored courses</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-semibold text-gray-800 mb-2">Partner Program Enrollments:</p>
                <ul className="space-y-1 ml-4 text-sm">
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Governed by specific partner agreement terms and conditions</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>May have different refund windows or requirements</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Contact <a href="mailto:partnerships@learnexity.com" className="text-blue-600 hover:underline">partnerships@learnexity.com</a> for partner-specific inquiries</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <p className="font-semibold text-gray-800 mb-2">Financial Aid Recipients:</p>
                <ul className="space-y-1 ml-4 text-sm">
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Forfeit all financial aid assistance if refund request is approved</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>May be required to repay financial aid funds received</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Future financial aid eligibility may be affected</span>
                  </li>
                  <li className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>Review financial aid terms before requesting refund</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Refund Request Process */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">6. Refund Request Process</h2>
          
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">6.1 Method 1: Student Dashboard (Recommended)</h3>
              <p className="font-semibold text-gray-800 mb-3">Step-by-step process:</p>
              <ol className="space-y-2 ml-6 mb-4">
                <li className="text-gray-700">1. Log into your Learnexity account at learnexity.org</li>
                <li className="text-gray-700">2. Navigate to "My Courses" or "Dashboard"</li>
                <li className="text-gray-700">3. Locate the specific course you wish to refund</li>
                <li className="text-gray-700">4. Click the "Request Refund" button (visible only within refund window)</li>
                <li className="text-gray-700">5. Complete the refund request form with required information</li>
                <li className="text-gray-700">6. Review refund amount calculation displayed</li>
                <li className="text-gray-700">7. Confirm refund method (original payment or course credit if eligible)</li>
                <li className="text-gray-700">8. Submit request</li>
                <li className="text-gray-700">9. Receive instant confirmation email with request reference number</li>
              </ol>
              
              <p className="font-semibold text-gray-800 mb-2">Advantages of dashboard method:</p>
              <ul className="space-y-1 ml-4 text-sm">
                <li className="text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>Instant submission confirmation</span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>Automatic completion percentage calculation</span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>Real-time eligibility verification</span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>Immediate reference number for tracking</span>
                </li>
                <li className="text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>Faster processing (2-3 business days vs 5-7 for email)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">6.2 Method 2: Email Request</h3>
            <p className="text-gray-700 mb-3">
              If unable to access your dashboard, send email refund request to: <a href="mailto:info@learnexity.com" className="text-blue-600 hover:underline font-semibold">info@learnexity.com</a>
            </p>
            
            <p className="font-semibold text-gray-800 mb-2">Required information in email:</p>
            <ul className="space-y-2 ml-4 mb-4">
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Subject Line:</strong> "Refund Request - [Your Full Name] - [Course Name]"</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Full legal name (as registered on account)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Email address associated with Learnexity account</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Course name and enrollment date</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Original payment date and transaction ID or receipt number</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Payment amount and payment method used</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Current course completion status (estimate percentage)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Detailed reason for refund request (minimum 100 words)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Any supporting documentation (attachments)</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Contact phone number</span>
              </li>
              <li className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>Preferred refund method (if options available)</span>
              </li>
            </ul>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-gray-700 text-sm">
                <strong>Processing time:</strong> 5-14 business days for email requests (vs 2-3 days for dashboard)
              </p>
              <p className="text-gray-700 text-sm mt-2">
                <strong>Note:</strong> Email requests require manual verification which extends processing time. Dashboard method strongly recommended for faster resolution.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">6.3 Method 3: WhatsApp or Live Chat Support</h3>
            
            <p className="font-semibold text-gray-800 mb-2">Contact channels:</p>
            <ul className="space-y-1 ml-4 mb-4">
              <li className="text-gray-700">
                <strong>WhatsApp:</strong> <a href="https://wa.me/12762528415" className="text-blue-600 hover:underline">+1 (276) 252-8415</a>
              </li>
              <li className="text-gray-700">
                <strong>Live Chat:</strong> Available Monday-Friday, 9:00 AM - 8:00 PM WAT (GMT + 1)
              </li>
            </ul>
            
            <p className="font-semibold text-gray-800 mb-2">Process:</p>
            <ol className="space-y-2 ml-6 mb-4">
              <li className="text-gray-700">1. Initiate contact via WhatsApp or live chat during business hours</li>
              <li className="text-gray-700">2. Provide agent with all information listed in Section 6.2 (Email Request)</li>
              <li className="text-gray-700">3. Agent will guide you through verification process</li>
              <li className="text-gray-700">4. May be directed to complete formal submission via dashboard or email</li>
              <li className="text-gray-700">5. Receive confirmation and reference number</li>
            </ol>
            
            <p className="text-gray-700 text-sm italic">
              <strong>Note:</strong> While support agents can answer questions and guide you, formal refund requests must ultimately be submitted through dashboard or email for proper documentation and processing.
            </p>
          </div>
        </section>

        {/* Footer Note */}
        <div className="border-t-2 border-gray-300 pt-6 mt-12">
          <p className="text-gray-600 text-sm text-center italic">
            By using Learnexity services, you acknowledge that you have read and understood this Refund Policy.
          </p>
          <p className="text-gray-600 text-sm text-center mt-2">
            For questions or assistance, contact us at <a href="mailto:info@learnexity.com" className="text-blue-600 hover:underline">info@learnexity.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}