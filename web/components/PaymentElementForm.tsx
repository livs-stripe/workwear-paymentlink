"use client";

import { useMemo, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { TEST_CARD } from "@/lib/data";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise(): Promise<Stripe | null> | null {
  if (!publishableKey) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

interface Props {
  clientSecret: string;
  mode: "setup" | "payment";
  onSuccess: (id: string) => void;
  submitLabel?: string;
}

function TestCardHint() {
  return (
    <div className="rounded-md border border-dashed border-workwear-orange/50 bg-workwear-orange-light px-3 py-2 text-xs text-workwear-orange-dark">
      <span className="font-semibold">Test card:</span> {TEST_CARD.number}
      {"  "}·{"  "}Exp {TEST_CARD.exp}
      {"  "}·{"  "}CVC {TEST_CARD.cvc}
    </div>
  );
}

function InnerForm({ mode, onSuccess, submitLabel }: Omit<Props, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === "setup") {
        const { error: err, setupIntent } = await stripe.confirmSetup({
          elements,
          redirect: "if_required",
        });
        if (err) {
          setError(err.message ?? "Setup failed");
        } else if (setupIntent?.payment_method) {
          onSuccess(
            typeof setupIntent.payment_method === "string"
              ? setupIntent.payment_method
              : setupIntent.payment_method.id
          );
        }
      } else {
        const { error: err, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });
        if (err) {
          setError(err.message ?? "Payment failed");
        } else if (paymentIntent) {
          onSuccess(paymentIntent.id);
        }
      }
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TestCardHint />
      <PaymentElement />
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-lg bg-workwear-orange px-4 py-2.5 font-semibold text-white transition-colors hover:bg-workwear-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Processing…"
          : submitLabel ?? (mode === "setup" ? "Save card" : "Pay now")}
      </button>
    </form>
  );
}

export default function PaymentElementForm({
  clientSecret,
  mode,
  onSuccess,
  submitLabel,
}: Props) {
  const promise = getStripePromise();

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#FF6B00",
          borderRadius: "8px",
        },
      },
    }),
    [clientSecret]
  );

  if (!promise) {
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        Set <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
        to enable card entry.
      </div>
    );
  }

  return (
    <Elements stripe={promise} options={options}>
      <InnerForm mode={mode} onSuccess={onSuccess} submitLabel={submitLabel} />
    </Elements>
  );
}
