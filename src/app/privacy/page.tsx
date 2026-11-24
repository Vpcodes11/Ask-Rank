export const metadata = { title: 'Privacy | AskRank' };

const company = process.env.NEXT_PUBLIC_COMPANY_NAME || 'AskRank';
const contact = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '';

export default function Privacy() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16 text-sm text-slate-300 leading-relaxed space-y-4 [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-8">
      <h1 className="text-3xl font-black text-white">Privacy policy</h1>
      <p className="text-slate-500">Last updated: 24 November 2026</p>
      <p>This policy explains what {company} (“we”) collects when you use AskRank and why.</p>

      <h2>What we collect</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><b>Store addresses you scan</b> and the public data we read from them (homepage, public product feed, product pages, sitemap).</li>
        <li><b>AI answers</b> returned for the buyer questions we ask on your behalf.</li>
        <li><b>Your email address</b>, if you unlock a report, sign in or buy. We use it to send sign-in links, receipts, reports and, if you unlocked a free report, occasional emails about your results. You can unsubscribe at any time.</li>
        <li><b>A one-way hash of your IP address</b>, used only to limit free scans.</li>
        <li><b>Payment details</b> are handled by Dodo Payments, our merchant of record. We never see your card number.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        To run scans we send buyer questions (not your personal data) to OpenAI, Perplexity and Google. We use Resend to deliver email, Neon to host our database, Vercel to host the
        site and Dodo Payments for billing. We do not sell personal data.
      </p>

      <h2>Report links</h2>
      <p>Scan reports are available to anyone who has the link. Don&apos;t share a link you want to keep private.</p>

      <h2>Retention and your rights</h2>
      <p>
        We keep scans and account data while your account is active, and delete them on request. You can ask us to access, correct or delete your data
        {contact ? <> by emailing <a className="underline" href={`mailto:${contact}`}>{contact}</a></> : ' by contacting us'}.
      </p>
    </article>
  );
}
