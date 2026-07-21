export default function TestModeBanner() {
  return (
    <div className="w-full bg-charcoal-light py-1.5 text-center text-xs font-medium uppercase tracking-wide text-white/70">
      Test mode — all payments use Stripe test keys. No real charges.
    </div>
  );
}
