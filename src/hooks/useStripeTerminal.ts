import {useCallback, useEffect, useState} from 'react';
import {
  useStripeTerminal as useSdkStripeTerminal,
  Reader,
} from '@stripe/stripe-terminal-react-native';
import {SIMULATOR_MODE} from '../constants/config';
import {createPaymentIntent} from '../lib/api';

// Discovery method:
// - Live demo (SIMULATOR_MODE = false): real "tapToPay" (needs the Apple
//   Tap to Pay entitlement + a paid Apple Developer account).
// - Free/no-entitlement demo (SIMULATOR_MODE = true): "bluetoothScan" against
//   the SDK's built-in simulated reader. This requires NO entitlement, so it
//   builds and runs on a device signed with a free Apple ID, and still creates
//   real PaymentIntents on your Stripe account. Only the physical tap is faked.
const DISCOVERY_METHOD: 'tapToPay' | 'bluetoothScan' = SIMULATOR_MODE
  ? 'bluetoothScan'
  : 'tapToPay';

// Test card presented by the simulated reader (always approves).
const SIMULATED_CARD = '4242424242424242';

export interface ChargeResult {
  amountCents: number;
  last4?: string;
  cardBrand?: string;
  timestamp: number;
}

/**
 * Wraps the Stripe Terminal SDK to expose a simple field-payment flow:
 * discover -> auto-connect a Tap to Pay (local mobile) reader -> charge.
 */
export function useTerminalPayments() {
  const [connected, setConnected] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [reader, setReader] = useState<Reader.Type | null>(null);

  const {
    discoverReaders,
    connectReader,
    retrievePaymentIntent,
    collectPaymentMethod,
    // Newer SDKs expose confirmPaymentIntent; older betas call this processPayment.
    confirmPaymentIntent,
    setSimulatedCard,
    connectedReader,
    discoveredReaders,
    initialize,
  } = useSdkStripeTerminal({
    onUpdateDiscoveredReaders: readers => {
      if (readers.length > 0 && !connectedReader) {
        void autoConnect(readers[0]);
      }
    },
    onDidChangeConnectionStatus: status => {
      setConnected(status === 'connected');
    },
  });

  const autoConnect = useCallback(
    async (candidate: Reader.Type) => {
      const {reader: connectedRdr, error} = await connectReader({
        discoveryMethod: DISCOVERY_METHOD,
        reader: candidate,
        // locationId is required for both methods; simulated readers carry a
        // mock location, otherwise fall back to the reader's own location.
        locationId: candidate.locationId ?? '',
      });
      if (error) {
        setConnected(false);
        return;
      }
      if (connectedRdr) {
        setReader(connectedRdr);
        setConnected(true);
        // In simulator mode, tell the virtual reader which card to present.
        if (SIMULATOR_MODE) {
          await setSimulatedCard(SIMULATED_CARD);
        }
      }
    },
    [connectReader, setSimulatedCard],
  );

  const startDiscovery = useCallback(async () => {
    setDiscovering(true);
    try {
      const {error} = await discoverReaders({
        discoveryMethod: DISCOVERY_METHOD,
        simulated: SIMULATOR_MODE,
      });
      if (error) {
        throw new Error(error.message);
      }
    } finally {
      setDiscovering(false);
    }
  }, [discoverReaders]);

  // Initialize the SDK exactly once. Every Terminal action (discover, connect,
  // charge) throws "First initialize the Stripe Terminal SDK before performing
  // any action" until initialize() has resolved successfully, so we must await
  // it and confirm there's no error before touching discovery.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {error} = await initialize();
        if (cancelled) {
          return;
        }
        if (error) {
          setInitError(error.message);
          return;
        }
        setInitError(null);
        setInitialized(true);
      } catch (err) {
        if (!cancelled) {
          setInitError(
            err instanceof Error ? err.message : 'Failed to initialize reader',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialize]);

  // Only start discovery after the SDK is confirmed initialized.
  useEffect(() => {
    if (initialized) {
      void startDiscovery();
    }
  }, [initialized, startDiscovery]);

  // Keep local connection state in sync with the SDK's connectedReader.
  useEffect(() => {
    if (connectedReader) {
      setReader(connectedReader);
      setConnected(true);
    }
  }, [connectedReader]);

  /**
   * Runs the full charge flow for a given amount (in cents).
   * 1. Create PaymentIntent on the server -> client_secret
   * 2. Retrieve it in the SDK
   * 3. collectPaymentMethod (Tap to Pay prompt)
   * 4. confirm/process the payment
   */
  const charge = useCallback(
    async (amountCents: number): Promise<ChargeResult> => {
      const clientSecret = await createPaymentIntent(amountCents);

      const {paymentIntent, error: retrieveError} =
        await retrievePaymentIntent(clientSecret);
      if (retrieveError || !paymentIntent) {
        throw new Error(retrieveError?.message ?? 'Could not retrieve payment');
      }

      const {paymentIntent: collectedPi, error: collectError} =
        await collectPaymentMethod({paymentIntent});
      if (collectError || !collectedPi) {
        throw new Error(collectError?.message ?? 'Card was not read');
      }

      const {paymentIntent: confirmedPi, error: confirmError} =
        await confirmPaymentIntent({paymentIntent: collectedPi});
      if (confirmError || !confirmedPi) {
        throw new Error(confirmError?.message ?? 'Payment failed');
      }

      const charge = confirmedPi.charges?.[0];
      const cardPresent = charge?.paymentMethodDetails?.cardPresentDetails;

      return {
        amountCents,
        last4: cardPresent?.last4 ?? undefined,
        cardBrand: cardPresent?.brand ?? undefined,
        timestamp: Date.now(),
      };
    },
    [retrievePaymentIntent, collectPaymentMethod, confirmPaymentIntent],
  );

  return {
    connected,
    discovering,
    initialized,
    initError,
    reader,
    discoveredReaders,
    startDiscovery,
    charge,
  };
}
