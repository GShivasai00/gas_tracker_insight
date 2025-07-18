import Head from 'next/head';
import { Dashboard } from '../components/Dashboard';

export default function Home() {
  return (
    <>
      <Head>
        <title>Cross-Chain Gas Tracker</title>
        <meta name="description" content="Real-time gas price tracker for Ethereum, Polygon, and Arbitrum" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Dashboard />
    </>
  );
}
