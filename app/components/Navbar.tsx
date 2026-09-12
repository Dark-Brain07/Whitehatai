'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  Terminal,
  Layers,
  Code2,
  ExternalLink,
} from 'lucide-react';

const CONTRACT_ADDRESS = '0xA38Ab4F28062721c19ea1cB4052F24aaB19d3C4F';
const EXPLORER_URL = `https://explorer-studio.genlayer.com/address/${CONTRACT_ADDRESS}`;

export default function Navbar() {
  const [activeTab, setActiveTab] = useState<'radar' | 'simulator' | 'terminal' | 'vaults' | 'sdk'>('simulator');

  const handleNav = (tab: 'radar' | 'simulator' | 'terminal' | 'vaults' | 'sdk', targetId: string) => {
    setActiveTab(tab);
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        {/* Brand */}
        <div
          className="brand"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setActiveTab('simulator');
          }}
        >
          <div className="brand-logo-wrap">
            <img src="/whitehat-logo.png?v=5" alt="WhitehatAI Logo" className="brand-logo-img" />
          </div>
          <span className="brand-title">WHITEHAT AI</span>
        </div>

        {/* Segmented Pill Navigation */}
        <nav className="header-nav-pill">
          <button
            onClick={() => handleNav('radar', 'radar')}
            className={`nav-pill-item ${activeTab === 'radar' ? 'active' : ''}`}
          >
            <ShieldAlert size={14} />
            <span>Threat Radar</span>
          </button>
          <button
            onClick={() => handleNav('simulator', 'simulator')}
            className={`nav-pill-item ${activeTab === 'simulator' ? 'active' : ''}`}
          >
            <Zap size={14} />
            <span>Judge Simulator</span>
          </button>
          <button
            onClick={() => handleNav('terminal', 'terminal')}
            className={`nav-pill-item ${activeTab === 'terminal' ? 'active' : ''}`}
          >
            <Terminal size={14} />
            <span>Whitehat Terminal</span>
          </button>
          <button
            onClick={() => handleNav('vaults', 'protocols')}
            className={`nav-pill-item ${activeTab === 'vaults' ? 'active' : ''}`}
          >
            <Layers size={14} />
            <span>Protected Vaults</span>
          </button>
          <button
            onClick={() => handleNav('sdk', 'integration')}
            className={`nav-pill-item ${activeTab === 'sdk' ? 'active' : ''}`}
          >
            <Code2 size={14} />
            <span>Integration SDK</span>
          </button>
        </nav>

        {/* Header Meta: Copy Contract Address, Explorer Button */}
        <div className="header-meta">


          <a
            href={EXPLORER_URL}
            target="_blank"
            rel="noreferrer"
            className="studio-btn"
            title="View Contract on GenLayer Studio Explorer"
          >
            <ExternalLink size={13} />
            <span>Explorer</span>
          </a>
        </div>
      </div>
    </header>
  );
}
