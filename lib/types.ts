export type ChainId = 'base' | 'arbitrum' | 'ethereum' | 'genlayer';

export interface ProtocolProfile {
  registered: boolean;
  chain_id: ChainId;
  target_address: string;
  protocol_name: string;
  is_halted: boolean;
  halt_count: number;
  bounty_pool: number; // in ETH or tokens
  last_halt_reason: string;
  guardian: string;
}

export interface ExploitReport {
  report_id: string;
  chain_id: ChainId;
  target_address: string;
  protocol_name: string;
  reporter: string;
  evidence_url: string;
  attack_type: string;
  attack_summary: string;
  action: 'EMERGENCY_HALT' | 'DISMISS_FALSE_ALARM';
  is_halt: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NONE';
  rationale: string;
  bounty_awarded: number;
  status: 'CIRCUIT_BREAKER_TRIGGERED' | 'FALSE_ALARM_DISMISSED';
  timestamp?: string;
  validatorVotes?: {
    validator: string;
    model: string;
    vote: 'agree' | 'idle' | 'disagree';
  }[];
}

export interface ThreatScenario {
  id: string;
  title: string;
  chain: ChainId;
  protocolName: string;
  targetAddress: string;
  attackType: string;
  summary: string;
  evidenceUrl: string;
  expectedAction: 'EMERGENCY_HALT' | 'DISMISS_FALSE_ALARM';
  expectedSeverity: 'CRITICAL' | 'HIGH' | 'NONE';
  drainedEstimate: string;
}

export interface ValidatorConsensusTelemetry {
  step: 'idle' | 'fetch_web' | 'llm_reasoning' | 'validator_quorum' | 'circuit_halt';
  leaderModel: string;
  evidenceSource: string;
  quorumAgreed: boolean;
  confidence: number;
  durationMs: number;
  txHash?: string;
}
