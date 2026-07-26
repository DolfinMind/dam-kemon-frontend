import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <article className="container-tight max-w-3xl py-10 sm:py-14 lg:py-16">
      <p className="text-xs font-mono uppercase tracking-[0.16em] text-acid-deep mb-3">Privacy</p>
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-ink">How Damkemon uses account data</h1>
      <div className="mt-7 space-y-6 text-sm leading-7 text-ink/80">
        <p>We collect the account details you provide, such as your name, email address, password, and optional preferences. We use them to run your account, save products, send requested price alerts after email verification, and—only if you opt in—send the newsletter.</p>
        <p>We retain account and alert data while it is needed to provide those features. You can change profile details and newsletter choices in your account. For access, correction, or deletion requests, contact us at <a className="font-semibold text-ink underline" href="mailto:support@damkemon.com">support@damkemon.com</a>.</p>
        <p>We use analytics to understand how the site is used, and service providers such as Google for sign-in and Resend for email delivery. If advertising measurement is configured, Meta Pixel remains off unless this browser has an explicit local consent setting.</p>
        <p>Product prices and availability are observed from shops and can change. Alerts are based on the prices we have most recently observed; they are not a guarantee of stock, price, or delivery.</p>
      </div>
      <Link to="/" className="inline-flex mt-8 text-sm font-semibold text-ink hover:text-red">Back to comparison</Link>
    </article>
  );
}
