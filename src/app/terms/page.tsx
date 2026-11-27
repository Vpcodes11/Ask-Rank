export const metadata = { title: 'Terms | AskRank' };

const company = process.env.NEXT_PUBLIC_COMPANY_NAME || 'AskRank';
const contact = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '';

export default function Terms() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16 text-sm text-slate-300 leading-relaxed space-y-4 [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-8">
      <h1 className="text-3xl font-black text-white">Terms of service</h1>
      <p className="text-slate-500">Last updated: 24 November 2026</p>
      <p>These terms apply to your use of AskRank, provided by {company}. By using AskRank you agree to them.</p>

      <h2>What AskRank does</h2>
      <p>
        AskRank sends buyer questions to third-party AI services and reports how their answers mention stores. AI answers change over time and differ between users, accounts
        and locations. Reports describe the answers we received at the time of the scan; they are not a guarantee of how any AI service will answer anyone else, and we
        cannot guarantee any change in your visibility or sales.
      </p>

      <h2>Your use</h2>
      <p>Only scan stores you own, manage, or have a legitimate business reason to analyse. Don&apos;t use AskRank to overload or attack any website.</p>

      <h2>Content drafts</h2>
      <p>
        The Content Fixer drafts text from your existing product data. You are responsible for reviewing drafts and making sure anything you publish is accurate and lawful.
        AskRank never edits your store.
      </p>

      <h2>Payments and cancellation</h2>
      <p>
        Payments are processed by Dodo Payments as merchant of record. Subscriptions renew monthly until cancelled. You can cancel at any time from your dashboard and keep
        access until the end of the paid period. The one-time Deep Audit is delivered immediately; if it fails to generate, contact us for a refund.
      </p>

      <h2>Liability</h2>
      <p>AskRank is provided “as is”. To the extent permitted by law, our total liability is limited to the amount you paid us in the 12 months before the claim.</p>

      <h2>Contact</h2>
      <p>{contact ? <a className="underline" href={`mailto:${contact}`}>{contact}</a> : 'Contact us through the website.'}</p>
    </article>
  );
}
