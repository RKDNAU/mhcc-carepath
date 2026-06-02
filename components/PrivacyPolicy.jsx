import { X, ExternalLink } from 'lucide-react'

const SECTIONS = [
  {
    title: '1. Introduction',
    content: `The Mental Health Community Coalition of the ACT (MHCC ACT) operates CarePath, a platform designed to connect individuals in the ACT and surrounding region with mental health support services. This Privacy Policy explains how we collect, use, store, and disclose personal information when you use CarePath.

MHCC ACT is bound by the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs). We take the privacy of individuals seriously and are committed to handling personal information responsibly, transparently, and with care.`,
  },
  {
    title: '2. Information we collect',
    content: `When you submit an intake form through CarePath, we may collect:

• Personal identifiers: your name, date of birth, and gender identity
• Contact information: email address, phone number, and suburb
• Health and sensitive information: the type of mental health support you are seeking, the urgency of your need, and any additional context you choose to share
• Access preferences: preferred contact method, timing, and how you would like to access services
• Optional free-text responses you voluntarily provide

We do not collect information you do not voluntarily provide. All fields marked optional are genuinely optional.`,
  },
  {
    title: '3. Why we collect this information',
    content: `We collect your personal information solely to:

• Assess your support needs and identify appropriate member organisations
• Facilitate a referral or connection to one or more CarePath member organisations
• Communicate with you about the status of your intake and referral
• Improve the accessibility and operation of the CarePath platform

We will not use your information for marketing purposes or share it with third parties for commercial gain.`,
  },
  {
    title: '4. Sensitive information',
    content: `Information about your mental health, health conditions, and related circumstances is classified as sensitive information under the Privacy Act 1988 (Cth). We collect and handle this information only with your explicit consent, and only for the purposes described in this policy.

You may withdraw consent at any time by contacting us. Please note that withdrawal of consent may affect our ability to connect you with appropriate services.`,
  },
  {
    title: '5. Who we share your information with',
    content: `Your intake information may be shared with:

• MHCC ACT staff and authorised volunteers involved in reviewing and processing your intake
• CarePath member organisations identified as appropriate to your needs, for the purpose of making contact and arranging support

We do not sell, rent, or disclose your personal information to any other third party except where required by law or with your consent.

Member organisations that receive your information are required to handle it in accordance with their own privacy policies and applicable Australian privacy law.`,
  },
  {
    title: '6. Data storage and security',
    content: `Your information is stored securely and access is restricted to authorised MHCC ACT personnel. We take reasonable technical and organisational steps to protect your information from misuse, loss, and unauthorised access, modification, or disclosure.

While we endeavour to protect all personal information, no data transmission or storage system can be guaranteed as completely secure. If you believe your information has been compromised, please contact us immediately.`,
  },
  {
    title: '7. Retention',
    content: `We retain your information only for as long as necessary to fulfil the purposes for which it was collected, or as required by law. Once your referral process is complete and no ongoing relationship exists, your personal information will be de-identified or securely destroyed in accordance with our records management policy.`,
  },
  {
    title: '8. Your rights',
    content: `Under the Australian Privacy Principles, you have the right to:

• Request access to the personal information we hold about you
• Request correction of inaccurate, incomplete, or out-of-date information
• Withdraw consent for the use of your information
• Make a complaint about how we have handled your information

To exercise any of these rights, please contact us using the details below.`,
  },
  {
    title: '9. Complaints',
    content: `If you believe we have not handled your personal information appropriately, please contact us in the first instance so we can attempt to resolve your concern.

If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC).`,
  },
  {
    title: '10. Contact us',
    content: `For privacy-related enquiries, access requests, or to make a complaint:

Mental Health Community Coalition of the ACT
Room 1.06, The Griffin Centre
Canberra City ACT 2601

Phone: (02) 5104 7710
Email: admin@mhccact.org.au`,
  },
]

export default function PrivacyPolicy({ onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Privacy Policy</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mental Health Community Coalition of the ACT · Effective May 2026
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
            CarePath is operated by MHCC ACT, a not-for-profit peak body funded by the ACT Government.
            We are committed to protecting your privacy in accordance with the{' '}
            <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles.
          </p>

          {SECTIONS.map(({ title, content }) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{title}</h3>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {content}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
            <ExternalLink size={12} />
            <a
              href="https://www.oaic.gov.au"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              Office of the Australian Information Commissioner - www.oaic.gov.au
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 flex-shrink-0 flex justify-end">
          <button onClick={onClose} className="btn-primary text-sm py-2">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
