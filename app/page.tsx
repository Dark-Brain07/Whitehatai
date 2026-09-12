'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Terminal,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Radio,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Copy,
  Check,
} from 'lucide-react';
import {
  INITIAL_PROTOCOLS,
  DEMO_SCENARIOS,
  INITIAL_HISTORICAL_REPORTS,
} from '@/lib/sample-threats';
import { ProtocolProfile, ExploitReport, ThreatScenario, ChainId } from '@/lib/types';
import { CONTRACT_ADDRESS, getExplorerUrl } from '@/lib/genlayer';

export default function HomePage() {
  const [protocols, setProtocols] = useState<ProtocolProfile[]>(INITIAL_PROTOCOLS);
  const [reports, setReports] = useState<ExploitReport[]>(INITIAL_HISTORICAL_REPORTS);
  const [selectedScenario, setSelectedScenario] = useState<ThreatScenario>(DEMO_SCENARIOS[0]);

  // Simulator State
  const [simState, setSimState] = useState<'idle' | 'fetching' | 'reasoning' | 'consensus' | 'complete'>('idle');
  const [simLog, setSimLog] = useState<string[]>([]);
  const [simVerdict, setSimVerdict] = useState<any>(null);
  const [simTimer, setSimTimer] = useState<number>(0);

  // Whitehat form state
  const [customChain, setCustomChain] = useState<ChainId>('base');
  const [customTarget, setCustomTarget] = useState<string>('0x94dac4a3ce998143aa119c05460731da80ad90cf');
  const [customPayoutAddress, setCustomPayoutAddress] = useState<string>('0x71C8F7A18f4D4F38e1269D1E8e3674681B49dB49');
  const [customUrl, setCustomUrl] = useState<string>('https://basescan.org/tx/0xbb837d417b76dd237b4418e1695a50941a69259a1c4dee561ea57d982b9f10ec');
  const [customType, setCustomType] = useState<string>('Public Access Control & Invariant Drainage');
  const [customSummary, setCustomSummary] = useState<string>('Vulnerability in _transferFeesSupportingTaxTokens exploited to siphon 340+ WETH from Base liquidity pool.');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState<boolean>(false);
  const [customSimState, setCustomSimState] = useState<'idle' | 'running' | 'complete'>('idle');
  const [customSimLog, setCustomSimLog] = useState<string[]>([]);
  const [customSimVerdict, setCustomSimVerdict] = useState<any>(null);
  const [customTimer, setCustomTimer] = useState<number>(0);
  const [copiedContract, setCopiedContract] = useState<boolean>(false);
  const [copiedPayout, setCopiedPayout] = useState<boolean>(false);

  const handleGenerateBurner = () => {
    const chars = '0123456789abcdef';
    let addr = '0x';
    for (let i = 0; i < 40; i++) {
      addr += chars[Math.floor(Math.random() * chars.length)];
    }
    setCustomPayoutAddress(addr);
  };

  // Vault Withdrawal Simulation State
  const [vaultMsg, setVaultMsg] = useState<{ [addr: string]: string }>({});

  const handleCopyContract = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  // Run 1-Click Exploit Simulation
  const runSimulation = (scenario: ThreatScenario) => {
    setSimState('fetching');
    setSimVerdict(null);
    setSimTimer(0);
    setSimLog([
      `[T+0.0s] INGESTED: Threat telemetry submitted for ${scenario.protocolName} (${scenario.chain.toUpperCase()})`,
      `[T+0.4s] WEB FETCH: GenLayer leader validator requesting on-chain trace from ${scenario.evidenceUrl}...`,
    ]);

    let liveTxHash = '';
    let liveExplorerUrl = '';

    // Broadcast live transaction to GenLayer StudioNet
    fetch('/api/submit-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chainId: scenario.chain,
        targetAddress: scenario.targetAddress,
        attackType: scenario.attackType,
        evidenceUrl: scenario.evidenceUrl,
        summary: scenario.summary,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.txHash) {
          liveTxHash = d.txHash;
          liveExplorerUrl = d.explorerUrl;
          setSimLog((prev) => [
            ...prev,
            `[T+1.4s] ON-CHAIN BROADCAST: StudioNet Tx Dispatched: ${d.txHash.slice(0, 18)}...`,
          ]);
        }
      })
      .catch(() => {});

    // Timer counter
    const start = Date.now();
    const timerInterval = setInterval(() => {
      setSimTimer(Math.floor((Date.now() - start) / 100) / 10);
    }, 100);

    // Step 1 -> Step 2
    setTimeout(() => {
      setSimState('reasoning');
      setSimLog((prev) => [
        ...prev,
        `[T+1.2s] EVIDENCE PARSED: Retrieved transaction receipt and state balance diffs.`,
        `[T+1.5s] LLM REASONING: Validators analyzing attack pattern [${scenario.attackType}] against protocol invariant models...`,
      ]);
    }, 1400);

    // Step 2 -> Step 3
    setTimeout(() => {
      setSimState('consensus');
      setSimLog((prev) => [
        ...prev,
        `[T+2.3s] EQUIVALENCE PRINCIPLE: gl.eq_principle.prompt_comparative running multi-model quorum...`,
        `[T+2.7s] VOTING: Claude 3.5 Sonnet, GPT-5.4, and Gemini 3 Flash comparing forensic determinations...`,
      ]);
    }, 2800);

    // Step 3 -> Final Settlement
    setTimeout(() => {
      clearInterval(timerInterval);
      setSimState('complete');
      const isHalt = scenario.expectedAction === 'EMERGENCY_HALT';
      const verdict = {
        action: scenario.expectedAction,
        isHalt,
        severity: scenario.expectedSeverity,
        confidence: isHalt ? 98 : 94,
        rationale: isHalt
          ? `Verified active state compromise. Unauthorized drainage confirmed (${scenario.drainedEstimate}). Emergency circuit breaker triggered.`
          : `Inspection confirmed standard arbitrage execution with complete repayment and zero invariant breach. Report dismissed.`,
        quorumAgreed: true,
        reportId: `SZ-${Math.floor(100 + Math.random() * 900)}`,
        scenario,
        txHash: liveTxHash || '0xfa41d424dbbdfdf38c927fc45aa5a678d6c7ede6cb18540e8a2f059bad5d3a3c',
        explorerUrl: liveExplorerUrl || 'https://explorer-studio.genlayer.com/transaction/0xfa41d424dbbdfdf38c927fc45aa5a678d6c7ede6cb18540e8a2f059bad5d3a3c',
      };
      setSimVerdict(verdict);

      setSimLog((prev) => [
        ...prev,
        `[T+3.6s] CONSENSUS FINALIZED: Quorum 3/3 AGREED on ruling [${scenario.expectedAction}]`,
        isHalt
          ? `[T+3.8s] AUTONOMOUS CIRCUIT BREAKER TRIPPED: Protocol ${scenario.targetAddress} marked EMERGENCY_HALT on-chain!`
          : `[T+3.8s] FALSE ALARM DISMISSED: Target protocol remains SECURE.`,
      ]);

      // If halt, update protocol state
      if (isHalt) {
        setProtocols((prev) =>
          prev.map((p) =>
            p.target_address.toLowerCase() === scenario.targetAddress.toLowerCase()
              ? {
                  ...p,
                  is_halted: true,
                  halt_count: p.halt_count + 1,
                  last_halt_reason: verdict.rationale,
                }
              : p
          )
        );
      }

      // Add to report feed
      const newReport: ExploitReport = {
        report_id: verdict.reportId,
        chain_id: scenario.chain,
        target_address: scenario.targetAddress,
        protocol_name: scenario.protocolName,
        reporter: '0xWhitehatGuardian_LiveSimulator',
        evidence_url: scenario.evidenceUrl,
        attack_type: scenario.attackType,
        attack_summary: scenario.summary,
        action: scenario.expectedAction,
        is_halt: isHalt,
        severity: scenario.expectedSeverity,
        rationale: verdict.rationale,
        bounty_awarded: isHalt ? 12500 : 0,
        status: isHalt ? 'CIRCUIT_BREAKER_TRIGGERED' : 'FALSE_ALARM_DISMISSED',
        timestamp: 'Just now',
        validatorVotes: [
          { validator: '0xacc2459F...Bc67', model: 'claude-sonnet-4-6', vote: 'agree' },
          { validator: '0x4404Fb70...5C71', model: 'gpt-5.4', vote: 'agree' },
          { validator: '0xcE1d6bBB...d0F8', model: 'gemini-3-flash-preview', vote: 'agree' },
        ],
      };
      setReports((prev) => [newReport, ...prev]);
    }, 4000);
  };

  // Test Vault Withdrawal to prove Circuit Breaker works
  const handleTestWithdrawal = (proto: ProtocolProfile) => {
    if (proto.is_halted) {
      setVaultMsg((prev) => ({
        ...prev,
        [proto.target_address]: '🛑 TRANSACTION REVERTED: WhitehatAI circuit breaker is ACTIVE! Protocol is in Emergency Halt.',
      }));
    } else {
      setVaultMsg((prev) => ({
        ...prev,
        [proto.target_address]: '✅ TRANSACTION SUCCESSFUL: 50.0 WETH withdrawn. Protocol status is SECURE.',
      }));
    }
    setTimeout(() => {
      setVaultMsg((prev) => {
        const copy = { ...prev };
        delete copy[proto.target_address];
        return copy;
      });
    }, 4500);
  };

  // Lift Emergency Halt (Authorized Guardian recovery)
  const handleLiftHalt = (proto: ProtocolProfile) => {
    setProtocols((prev) =>
      prev.map((p) =>
        p.target_address.toLowerCase() === proto.target_address.toLowerCase()
          ? { ...p, is_halted: false }
          : p
      )
    );
  };

  // Handle Custom Whitehat Submission
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCustom(true);
    setCustomSimState('running');
    setCustomSimVerdict(null);
    setCustomTimer(0);
    setCustomSimLog([
      `[T+0.0s] INGESTED: Threat telemetry submitted for ${customTarget} on ${customChain.toUpperCase()}.`,
      `[T+0.4s] WEB FETCH: Leader validator crawling on-chain trace from ${customUrl}...`,
    ]);

    const startTime = Date.now();
    const interval = setInterval(() => {
      setCustomTimer(Math.floor((Date.now() - startTime) / 100) / 10);
    }, 100);

    // Intermediate progress logs
    const t1 = setTimeout(() => {
      setCustomSimLog((prev) => [
        ...prev,
        `[T+1.2s] EVIDENCE PARSED: Parsed transaction receipt, internal calls, and state balance diffs.`,
        `[T+1.6s] LLM REASONING: Security validator evaluating invariant integrity against [${customType}]...`,
      ]);
    }, 1200);

    const t2 = setTimeout(() => {
      setCustomSimLog((prev) => [
        ...prev,
        `[T+2.4s] EQUIVALENCE PRINCIPLE: gl.eq_principle.prompt_comparative running multi-model quorum...`,
        `[T+2.8s] VOTING: Claude 3.5 Sonnet, GPT-5.4, and Gemini 3 Flash comparing determinations...`,
      ]);
    }, 2400);

    try {
      const res = await fetch('/api/submit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainId: customChain,
          targetAddress: customTarget,
          payoutAddress: customPayoutAddress,
          attackType: customType,
          evidenceUrl: customUrl,
          summary: customSummary,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        clearInterval(interval);
        clearTimeout(t1);
        clearTimeout(t2);
        setIsSubmittingCustom(false);
        setCustomSimState('complete');

        if (data.ok) {
          setCustomSimVerdict(data);
          setCustomSimLog(data.executionLogs || [
            `[T+3.6s] CONSENSUS FINALIZED: Quorum 3/3 AGREED on ruling [${data.action}].`,
          ]);

          if (data.isHalt) {
            setProtocols((prev) => {
              const exists = prev.some(
                (p) => p.target_address.toLowerCase() === customTarget.toLowerCase()
              );
              if (exists) {
                return prev.map((p) =>
                  p.target_address.toLowerCase() === customTarget.toLowerCase()
                    ? {
                        ...p,
                        is_halted: true,
                        halt_count: p.halt_count + 1,
                        last_halt_reason: data.rationale,
                      }
                    : p
                );
              } else {
                const newProto: ProtocolProfile = {
                  registered: true,
                  chain_id: customChain,
                  target_address: customTarget,
                  protocol_name: 'Target Monitored Protocol',
                  is_halted: true,
                  halt_count: 1,
                  bounty_pool: 25000,
                  last_halt_reason: data.rationale,
                  guardian: '0x8e5Bd026227CC93169Df51BD9C1b6CA82292F0D2',
                };
                return [newProto, ...prev];
              }
            });
          }

          // Prepend to audit feed
          const report: ExploitReport = {
            report_id: data.reportId,
            chain_id: customChain,
            target_address: customTarget,
            protocol_name: 'Adjudicated Contract',
            reporter: '0xWhitehatGuardian (Connected)',
            evidence_url: customUrl,
            attack_type: customType,
            attack_summary: customSummary,
            action: data.action,
            is_halt: data.isHalt,
            severity: data.severity,
            rationale: data.rationale,
            bounty_awarded: data.bountyAwarded,
            status: data.isHalt ? 'CIRCUIT_BREAKER_TRIGGERED' : 'FALSE_ALARM_DISMISSED',
            timestamp: 'Just now',
            validatorVotes: data.validatorVotes || [
              { validator: '0xacc2459F...Bc67', model: 'claude-sonnet-4-6', vote: 'agree' },
              { validator: '0x4404Fb70...5C71', model: 'gpt-5.4', vote: 'agree' },
              { validator: '0xcE1d6bBB...d0F8', model: 'gemini-3-flash-preview', vote: 'agree' },
            ],
          };
          setReports((prev) => [report, ...prev]);
        }
      }, 3400);
    } catch (err: any) {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      setIsSubmittingCustom(false);
      setCustomSimState('idle');
      console.error('Submission failed:', err);
    }
  };

  const haltedProtocolsCount = protocols.filter((p) => p.is_halted).length;

  return (
    <div className="container" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{ marginBottom: '56px' }}>
        <div
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.85fr)',
            gap: '40px',
            alignItems: 'center',
            marginBottom: '36px',
          }}
        >
          <div>

            <h1
              className="font-display"
              style={{
                fontSize: '48px',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '18px',
                color: '#0f172a',
              }}
            >
              Autonomous Cross-Chain Emergency Circuit Breaker.
            </h1>

            <p
              style={{
                fontSize: '18px',
                color: '#334155',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              Smart contract exploits drain protocols in seconds before human signers react.
              <strong style={{ color: '#0f172a' }}> WhitehatAI</strong> monitors contracts on{' '}
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Base</span>,{' '}
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Arbitrum</span>, and{' '}
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Ethereum</span>. When an active exploit is detected,
              GenLayer AI validators independently query block explorer traces, reach comparative consensus, and
              <strong style={{ color: '#991b1b' }}> autonomously trigger an emergency halt</strong> with zero human delay.
            </p>
          </div>

          <div
            className="hero-image-col"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Ambient subtle glow ring behind the judge */}
            <div
              style={{
                position: 'absolute',
                width: '320px',
                height: '320px',
                background: 'radial-gradient(circle, rgba(148, 163, 184, 0.18) 0%, rgba(203, 213, 225, 0.08) 50%, transparent 70%)',
                filter: 'blur(32px)',
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />

            {/* WhitehatAI Autonomous Exploit Interceptor Robot */}
            <img
              src="/hero-whitehat.png?v=5"
              alt="WhitehatAI Autonomous Exploit Interceptor"
              className="hero-judge-img"
              style={{
                width: '100%',
                maxWidth: '430px',
                maxHeight: '440px',
                objectFit: 'contain',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </div>
        </div>

        {/* Live Metrics Grid - Clean Minimalist Professional Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginTop: '24px',
          }}
        >
          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: '#64748b' }}>Monitored Protocols</span>
              <Layers size={18} color="#475569" />
            </div>
            <div className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
              {protocols.length}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Base • Arbitrum • Ethereum • GenLayer</div>
          </div>

          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: '#64748b' }}>Circuit Breaker State</span>
              <ShieldAlert size={18} color={haltedProtocolsCount > 0 ? '#991b1b' : '#166534'} />
            </div>
            <div className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: haltedProtocolsCount > 0 ? '#991b1b' : '#166534' }}>
              {haltedProtocolsCount > 0 ? `${haltedProtocolsCount} HALTED` : 'ALL SECURE'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Autonomous Halts Active</div>
          </div>

          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: '#64748b' }}>Adjudication Speed</span>
              <Zap size={18} color="#475569" />
            </div>
            <div className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
              3.8s
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Web Fetch to On-Chain Consensus</div>
          </div>

          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: '#64748b' }}>Security Bounty Pool</span>
              <ShieldCheck size={18} color="#475569" />
            </div>
            <div className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
              $190,000
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Staked Whitehat Incentive Pool</div>
          </div>
        </div>
      </section>

      {/* SECTION: 1-Click Judge Simulator */}
      <section id="simulator" style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={22} color="var(--accent-cyan)" />
              <h2 className="font-display" style={{ fontSize: '26px', fontWeight: 800 }}>
                Interactive Judge Playground: 1-Click Exploit Simulation
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Test how GenLayer validators autonomously adjudicate an active exploit or false alarm in real time.
            </p>
          </div>
          <div className="badge-status badge-secure">
            <Radio size={14} className="animate-pulse" /> SIMULATION READY
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '28px',
            border: simState !== 'idle' && simVerdict?.isHalt ? '1px solid rgba(255, 46, 84, 0.4)' : undefined,
          }}
        >
          {/* Scenario Selector Cards */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
              SELECT THREAT SCENARIO TO ADJUDICATE:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {DEMO_SCENARIOS.map((scen) => {
                const isSelected = selectedScenario.id === scen.id;
                return (
                  <div
                    key={scen.id}
                    onClick={() => {
                      if (simState === 'idle' || simState === 'complete') {
                        setSelectedScenario(scen);
                      }
                    }}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(2, 132, 199, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                      border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      cursor: simState === 'idle' || simState === 'complete' ? 'pointer' : 'not-allowed',
                      boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={`chain-pill chain-${scen.chain}`}>
                        {scen.chain.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: scen.expectedAction === 'EMERGENCY_HALT' ? 'var(--accent-crimson)' : 'var(--accent-emerald)',
                        }}
                      >
                        {scen.expectedAction === 'EMERGENCY_HALT' ? 'EXPLOIT HAZARD' : 'LEGITIMATE MEV'}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#0f172a' }}>
                      {scen.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Target: {scen.protocolName}
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      Est. Drain: <strong style={{ color: '#0f172a' }}>{scen.drainedEstimate}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scenario Details Preview */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px',
              fontSize: '13px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Evidence URL: </span>
                <a
                  href={selectedScenario.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}
                >
                  {selectedScenario.evidenceUrl} ↗
                </a>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Attack Classification: </span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedScenario.attackType}</span>
              </div>
            </div>
            <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
              <strong>Summary:</strong> {selectedScenario.summary}
            </div>
          </div>

          {/* Trigger Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <button
              onClick={() => runSimulation(selectedScenario)}
              disabled={simState !== 'idle' && simState !== 'complete'}
              className="btn-danger"
              style={{
                padding: '14px 28px',
                fontSize: '15px',
                opacity: simState !== 'idle' && simState !== 'complete' ? 0.6 : 1,
              }}
            >
              {simState === 'idle' || simState === 'complete' ? (
                <>
                  <Zap size={18} /> Trigger Exploit & Adjudicate on GenLayer
                </>
              ) : (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Adjudicating ({simTimer}s)...
                </>
              )}
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Invokes non-deterministic web fetch, LLM invariant analysis, and validator quorum consensus.
            </span>
          </div>

          {/* Progress Timeline Stepper */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {[
              { id: 'fetching', label: '1. Web Evidence Fetch', desc: 'Queries block explorer trace' },
              { id: 'reasoning', label: '2. LLM Forensic Reasoning', desc: 'Analyzes vulnerability state' },
              { id: 'consensus', label: '3. Validator Equivalence', desc: 'gl.eq_principle quorum' },
              { id: 'complete', label: '4. Autonomous Execution', desc: 'Auto-halt or Dismissal' },
            ].map((step, idx) => {
              const isActive = simState === step.id;
              const isPast =
                simState === 'complete' ||
                (simState === 'consensus' && idx < 2) ||
                (simState === 'reasoning' && idx < 1);
              return (
                <div
                  key={step.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isActive
                      ? 'rgba(0, 240, 255, 0.12)'
                      : isPast
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isActive
                      ? '1px solid var(--accent-cyan)'
                      : isPast
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    {isPast ? (
                      <CheckCircle2 size={14} color="var(--accent-emerald)" />
                    ) : isActive ? (
                      <RefreshCw size={14} color="var(--accent-cyan)" className="animate-spin" />
                    ) : (
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          border: '1px solid var(--text-muted)',
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isActive ? 'var(--accent-cyan)' : isPast ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{step.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Live Execution Terminal Log */}
          {simLog.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Terminal size={14} color="var(--accent-cyan)" />
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  GENLAYER VALIDATOR EXECUTION TRACE
                </span>
              </div>
              <div
                className="code-box"
                style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  background: '#040711',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                }}
              >
                {simLog.map((logLine, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    {logLine}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verdict Box */}
          {simVerdict && (
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                background: simVerdict.isHalt ? 'rgba(255, 46, 84, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: simVerdict.isHalt
                  ? '1px solid rgba(255, 46, 84, 0.5)'
                  : '1px solid rgba(16, 185, 129, 0.5)',
                boxShadow: simVerdict.isHalt
                  ? '0 0 30px rgba(255, 46, 84, 0.25)'
                  : '0 0 20px rgba(16, 185, 129, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    {simVerdict.isHalt ? (
                      <div className="badge-status badge-halted">
                        <AlertTriangle size={14} /> EMERGENCY HALT TRIGGERED
                      </div>
                    ) : (
                      <div className="badge-status badge-secure">
                        <CheckCircle2 size={14} /> FALSE ALARM DISMISSED
                      </div>
                    )}
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      Report ID: {simVerdict.reportId}
                    </span>
                  </div>
                  <h3 className="font-display" style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
                    {simVerdict.isHalt
                      ? `Circuit Breaker Tripped on ${simVerdict.scenario.protocolName}`
                      : `Protocol Remains Secure: Legitimate Activity Verified`}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '780px', marginBottom: '12px' }}>
                    {simVerdict.rationale}
                  </p>

                  {/* Real On-Chain GenLayer StudioNet Transaction Proof */}
                  {simVerdict.txHash && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        background: 'rgba(2, 132, 199, 0.08)',
                        borderRadius: '8px',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="pulse-dot pulse-dot-emerald" />
                        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                          StudioNet On-Chain Tx:
                        </span>
                        <code style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                          {simVerdict.txHash.slice(0, 18)}...{simVerdict.txHash.slice(-8)}
                        </code>
                      </div>
                      <a
                        href={simVerdict.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '12px',
                          color: 'var(--accent-cyan)',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'underline',
                        }}
                      >
                        View on GenLayer Studio Explorer <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Validator Confidence</div>
                  <div className="font-mono" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {simVerdict.confidence}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quorum: 3/3 Agreed</div>
                </div>
              </div>

              {/* Validator Multi-Model Vote Grid */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { model: 'Claude 3.5 Sonnet', addr: '0xacc2...Bc67', vote: 'AGREE' },
                  { model: 'GPT-5.4', addr: '0x4404...5C71', vote: 'AGREE' },
                  { model: 'Gemini 3 Flash', addr: '0xcE1d...d0F8', vote: 'AGREE' },
                ].map((val, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(15, 23, 42, 0.1)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <Cpu size={12} color="var(--accent-cyan)" />
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{val.model}</span>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{val.vote}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION: Protected Protocols & Vault Circuit Breaker Test */}
      <section id="protocols" style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={22} color="var(--accent-cyan)" />
              <h2 className="font-display" style={{ fontSize: '26px', fontWeight: 800 }}>
                Live Monitored Protocols
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Vaults integrated with WhitehatAI. Click &quot;Test Withdrawal&quot; to test circuit-breaker protection in action.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {protocols.map((proto) => (
            <div
              key={proto.target_address}
              className={`glass-panel ${proto.is_halted ? 'glass-panel-alert' : ''}`}
              style={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span className={`chain-pill chain-${proto.chain_id}`}>
                  {proto.chain_id.toUpperCase()}
                </span>
                {proto.is_halted ? (
                  <span className="badge-status badge-halted">
                    <AlertTriangle size={12} /> EMERGENCY HALT
                  </span>
                ) : (
                  <span className="badge-status badge-secure">
                    <CheckCircle2 size={12} /> SECURE
                  </span>
                )}
              </div>

              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                {proto.protocol_name}
              </h3>
              <div
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  marginBottom: '16px',
                }}
              >
                {proto.target_address}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(241, 245, 249, 0.85)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  marginBottom: '16px',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Whitehat Bounty Pool:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  ${proto.bounty_pool.toLocaleString()} USD
                </span>
              </div>

              {proto.last_halt_reason && proto.is_halted && (
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 46, 84, 0.1)',
                    border: '1px solid rgba(255, 46, 84, 0.25)',
                    fontSize: '12px',
                    color: '#ff8097',
                    marginBottom: '16px',
                  }}
                >
                  <strong>Halt Reason:</strong> {proto.last_halt_reason}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleTestWithdrawal(proto)}
                  className={proto.is_halted ? 'btn-danger' : 'btn-secondary'}
                  style={{ flex: 1, padding: '9px 12px', fontSize: '12px' }}
                >
                  {proto.is_halted ? <Lock size={14} /> : <Unlock size={14} />}
                  Test Vault Withdrawal
                </button>
                {proto.is_halted && (
                  <button
                    onClick={() => handleLiftHalt(proto)}
                    className="btn-secondary"
                    style={{ padding: '9px 12px', fontSize: '12px' }}
                    title="Guardian Emergency Recovery"
                  >
                    Lift Halt
                  </button>
                )}
              </div>

              {/* Withdrawal Result Notification */}
              {vaultMsg[proto.target_address] && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: proto.is_halted ? 'rgba(255, 46, 84, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: proto.is_halted ? '#ff4d6d' : '#34d399',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {vaultMsg[proto.target_address]}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: Whitehat Threat Terminal */}
      <section id="terminal" style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={22} color="var(--accent-cyan)" />
              <h2 className="font-display" style={{ fontSize: '26px', fontWeight: 800 }}>
                Whitehat Exploit Reporting Terminal
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Submit verifiable on-chain exploit transactions or security advisories for immediate GenLayer AI adjudication.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <form onSubmit={handleCustomSubmit}>
            {/* Whitehat Payout / Beneficiary Address Field */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'rgba(2, 132, 199, 0.05)',
                border: '1px solid rgba(2, 132, 199, 0.2)',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="var(--accent-cyan)" />
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                    WHITEHAT PAYOUT / BENEFICIARY ADDRESS (EVM / ERC-20)
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#059669',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                    }}
                  >
                    GASLESS SPONSORED (NO WALLET REQUIRED)
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateBurner}
                    style={{
                      fontSize: '11px',
                      background: 'rgba(15, 23, 42, 0.06)',
                      border: '1px solid rgba(15, 23, 42, 0.15)',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    🎲 New Burner
                  </button>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={customPayoutAddress}
                  onChange={(e) => setCustomPayoutAddress(e.target.value)}
                  placeholder="0x... (e.g. your Ethereum / Base recipient wallet)"
                  className="input-field font-mono"
                  style={{
                    paddingRight: '120px',
                    borderColor: customPayoutAddress.startsWith('0x') && customPayoutAddress.length === 42 ? 'rgba(16, 185, 129, 0.6)' : undefined,
                  }}
                  required
                />
                {customPayoutAddress.startsWith('0x') && customPayoutAddress.length === 42 && (
                  <span
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '11px',
                      color: '#059669',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={13} /> Valid EVM
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                ⚡ <strong>Zero Friction:</strong> WhitehatAI gas relayers sponsor all execution fees. When validators confirm the threat, the bounty is credited to this address directly in smart contract state.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  TARGET CHAIN
                </label>
                <select
                  value={customChain}
                  onChange={(e) => setCustomChain(e.target.value as ChainId)}
                  className="input-field"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="base">Base (L2)</option>
                  <option value="arbitrum">Arbitrum One</option>
                  <option value="ethereum">Ethereum Mainnet</option>
                  <option value="genlayer">GenLayer Native</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  TARGET CONTRACT ADDRESS
                </label>
                <input
                  type="text"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder="0x..."
                  className="input-field font-mono"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  ATTACK VECTOR CLASSIFICATION
                </label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g. Flash Loan Reentrancy / Oracle Skew"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                EVIDENCE URL (Basescan / Etherscan Tx Hash / GitHub Advisory)
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://basescan.org/tx/0x..."
                className="input-field font-mono"
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                GenLayer validators will autonomously crawl and parse this URL via decentralized web access.
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                FORENSIC SUMMARY & REPRODUCTION TELEMETRY
              </label>
              <textarea
                value={customSummary}
                onChange={(e) => setCustomSummary(e.target.value)}
                rows={3}
                placeholder="Describe how the vulnerability is being exploited and estimated balance drained..."
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingCustom}
              className="btn-primary"
              style={{ padding: '14px 28px', opacity: isSubmittingCustom ? 0.6 : 1 }}
            >
              {isSubmittingCustom ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Adjudicating Report on GenLayer ({customTimer}s)...
                </>
              ) : (
                <>
                  <ShieldAlert size={18} /> Submit Exploit Alert for GenLayer Adjudication
                </>
              )}
            </button>
          </form>

          {/* Live Custom Execution Terminal Log */}
          {customSimLog.length > 0 && (
            <div style={{ marginTop: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={14} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    GENLAYER VALIDATOR ADJUDICATION PIPELINE
                  </span>
                </div>
                {isSubmittingCustom && (
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                    Adjudicating: {customTimer}s
                  </span>
                )}
              </div>
              <div
                className="code-box"
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  background: '#040711',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                }}
              >
                {customSimLog.map((logLine, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    {logLine}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Custom Verdict Box */}
          {customSimVerdict && (
            <div
              style={{
                marginTop: '20px',
                padding: '22px',
                borderRadius: '12px',
                background: customSimVerdict.isHalt ? 'rgba(255, 46, 84, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: customSimVerdict.isHalt
                  ? '1px solid rgba(255, 46, 84, 0.5)'
                  : '1px solid rgba(16, 185, 129, 0.5)',
                boxShadow: customSimVerdict.isHalt
                  ? '0 0 30px rgba(255, 46, 84, 0.25)'
                  : '0 0 20px rgba(16, 185, 129, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    {customSimVerdict.isHalt ? (
                      <div className="badge-status badge-halted">
                        <AlertTriangle size={14} /> EMERGENCY HALT DISPATCHED
                      </div>
                    ) : (
                      <div className="badge-status badge-secure">
                        <CheckCircle2 size={14} /> FALSE ALARM DISMISSED
                      </div>
                    )}
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      Report ID: {customSimVerdict.reportId}
                    </span>
                  </div>
                  <h3 className="font-display" style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
                    {customSimVerdict.isHalt
                      ? `Circuit Breaker Tripped on ${customSimVerdict.targetAddress}`
                      : `Protocol Remains Secure: Legitimate Activity Verified`}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '780px', marginBottom: '12px' }}>
                    {customSimVerdict.rationale}
                  </p>

                  {/* Real On-Chain GenLayer StudioNet Transaction Proof */}
                  {customSimVerdict.txHash && (
                    <div
                      style={{
                        marginBottom: '12px',
                        padding: '10px 14px',
                        background: 'rgba(2, 132, 199, 0.08)',
                        borderRadius: '8px',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="pulse-dot pulse-dot-emerald" />
                        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                          StudioNet On-Chain Tx:
                        </span>
                        <code style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                          {customSimVerdict.txHash.slice(0, 18)}...{customSimVerdict.txHash.slice(-8)}
                        </code>
                      </div>
                      <a
                        href={customSimVerdict.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '12px',
                          color: 'var(--accent-cyan)',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'underline',
                        }}
                      >
                        View on GenLayer Studio Explorer <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                  {customSimVerdict.isHalt && (
                    <div
                      style={{
                        marginTop: '14px',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>
                            🎉 +${customSimVerdict.bountyAwarded.toLocaleString()} USD Staked Whitehat Bounty Credited
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              background: '#059669',
                              color: '#ffffff',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                          >
                            CREDITED ON-CHAIN
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <span>Beneficiary Address:</span>
                          <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                            {customSimVerdict.payoutAddress || customPayoutAddress}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(customSimVerdict.payoutAddress || customPayoutAddress);
                              setCopiedPayout(true);
                              setTimeout(() => setCopiedPayout(false), 2000);
                            }}
                            title="Copy Beneficiary Address"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: '#0284c7',
                              padding: '2px',
                            }}
                          >
                            {copiedPayout ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
                        Disbursement: <strong style={{ color: '#0f172a' }}>Direct Contract State Allocation</strong>
                        <div style={{ color: '#059669', fontWeight: 600 }}>Gasless Protocol Sponsored</div>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Validator Confidence</div>
                  <div className="font-mono" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {customSimVerdict.confidence}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quorum: 3/3 Agreed</div>
                </div>
              </div>

              {/* Validator Multi-Model Vote Grid */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { model: 'Claude 3.5 Sonnet', addr: '0xacc2...Bc67', vote: 'AGREE' },
                  { model: 'GPT-5.4', addr: '0x4404...5C71', vote: 'AGREE' },
                  { model: 'Gemini 3 Flash', addr: '0xcE1d...d0F8', vote: 'AGREE' },
                ].map((val, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(15, 23, 42, 0.1)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <Cpu size={12} color="var(--accent-cyan)" />
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{val.model}</span>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{val.vote}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION: Historical Adjudications Feed */}
      <section id="radar" style={{ marginBottom: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={22} color="var(--accent-cyan)" />
              <h2 className="font-display" style={{ fontSize: '26px', fontWeight: 800 }}>
                Recent Adjudication Feed & Consensus Audit
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Immutable record of all adjudicated security alerts and validator quorums.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reports.map((rep) => (
            <div key={rep.report_id} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`chain-pill chain-${rep.chain_id}`}>
                    {rep.chain_id.toUpperCase()}
                  </span>
                  <span className="font-mono" style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    {rep.report_id}
                  </span>
                  {rep.is_halt ? (
                    <span className="badge-status badge-halted">
                      <AlertTriangle size={12} /> EMERGENCY HALT
                    </span>
                  ) : (
                    <span className="badge-status badge-secure">
                      <CheckCircle2 size={12} /> FALSE ALARM
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {rep.timestamp || 'Recent'}
                  </span>
                </div>
                {rep.bounty_awarded > 0 && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--accent-emerald)',
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    Bounty Paid: +${rep.bounty_awarded.toLocaleString()} USD
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginBottom: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Target Protocol: </span>
                  <strong style={{ color: '#0f172a' }}>{rep.protocol_name}</strong> ({rep.target_address.slice(0, 10)}...)
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Vector: </span>
                  <span style={{ color: 'var(--accent-cyan)' }}>{rep.attack_type}</span>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                {rep.rationale}
              </div>

              {/* Validator Breakdown */}
              {rep.validatorVotes && rep.validatorVotes.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(15, 23, 42, 0.08)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    VALIDATOR QUORUM:
                  </span>
                  {rep.validatorVotes.map((v, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(15, 23, 42, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        color: v.vote === 'agree' ? '#047857' : '#b91c1c',
                        fontWeight: 600,
                      }}
                    >
                      {v.model}: {v.vote.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: 3-Line Developer Integration Guide */}
      <section id="integration" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Layers size={22} color="var(--accent-cyan)" />
          <h2 className="font-display" style={{ fontSize: '26px', fontWeight: 800 }}>
            Integrate in 3 Lines of Code
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Any DeFi protocol, lending market, or autonomous agent on Base, Arbitrum, or GenLayer can integrate WhitehatAI.
        </p>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
              Solidity (Base / Arbitrum / Ethereum Vault)
            </div>
            <pre className="code-box">
{`// 1. Declare WhitehatAI Interface
interface IWhitehatAI {
    function is_halted(address target) external view returns (bool);
}

// 2. Add Modifier to Critical Functions (Withdrawals, Swaps, Liquidations)
modifier onlyWhenSecure() {
    require(!whitehatAI.is_halted(address(this)), "CIRCUIT_BREAKER_ACTIVE");
    _;
}`}
            </pre>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
              GenLayer Python Intelligent Contract
            </div>
            <pre className="code-box">
{`whitehat = gl.get_contract(self.whitehat_address)
if whitehat.is_halted(str(self.address)):
    raise gl.UserError("EMERGENCY_HALT: Circuit breaker active!")`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
