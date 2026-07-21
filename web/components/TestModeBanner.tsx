export default function TestModeBanner() {
  return (
    <div className="w-full bg-workwear-orange-light py-1.5 text-center text-xs font-medium text-workwear-orange-dark">
      Test mode — all payments use Stripe test keys. No real charges.
    </div>
  );
}
