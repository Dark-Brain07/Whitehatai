import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'WhitehatAI — Autonomous Cross-Chain Circuit Breaker | GenLayer',
  description:
    'Autonomous emergency halt protocol. Pauses target contracts across Base, Arbitrum, and Ethereum when GenLayer AI validators verify active exploits.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?v=4" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png?v=4" />
        <link rel="apple-touch-icon" href="/favicon.png?v=4" />
      </head>
      <body>
        {/* Navigation Bar */}
        <Navbar />


        {/* Main Application */}
        <main>{children}</main>

        {/* Footer */}
        <footer
          style={{
            marginTop: '80px',
            borderTop: '1px solid rgba(15, 23, 42, 0.1)',
            padding: '40px 0',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src="/whitehat-logo.png?v=5"
                alt="WhitehatAI Logo"
                style={{
                  height: '38px',
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="font-display" style={{ fontWeight: 800, color: '#0f172a', fontSize: '16px' }}>
                    WHITEHAT AI
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Built for the GenLayer Agent Tank Hackathon (Autonomous Protocols Track)
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  &quot;Build on Base / Arbitrum / Ethereum. Adjudicate on GenLayer.&quot;
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
              <a
                href="https://portal.genlayer.foundation/agent-tank/"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}
              >
                Agent Tank Portal ↗
              </a>
              <a
                href="https://docs.genlayer.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--text-secondary)' }}
              >
                GenLayer Docs ↗
              </a>
              <a
                href="https://explorer-studio.genlayer.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--text-secondary)' }}
              >
                StudioNet Explorer ↗
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
