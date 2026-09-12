# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


class WhitehatAI(gl.Contract):
    """
    WhitehatAI: Autonomous Cross-Chain Emergency Circuit Breaker.
    Monitors protocols across Base, Arbitrum, Ethereum, and GenLayer.
    When an active exploit, unauthorized drain, or reentrancy is reported,
    GenLayer validators independently fetch the on-chain evidence (Basescan/Etherscan/RPC/Advisory),
    evaluate with LLM comparative consensus, and autonomously trigger the circuit-breaker halt.
    """

    owner: Address
    report_nonce: u256
    protocol_count: u256

    # Storage mappings (TreeMap compliant with GenVM)
    # protocol_key: "{chain_id}:{target_address.lower()}" -> JSON-encoded protocol profile
    protocols: TreeMap[str, str]

    # report_id: "REP-{nonce}" -> JSON-encoded exploit report & consensus verdict
    reports: TreeMap[str, str]

    # Protocol addresses indexed for quick lookup: target_address.lower() -> chain_id
    target_to_chain: TreeMap[str, str]

    # Global emergency pause state lookup: target_address.lower() -> bool
    halted_status: TreeMap[str, bool]

    # Staked whitehat bond balances: Address -> u256 (in atto)
    whitehat_rewards: TreeMap[Address, u256]

    def __init__(self):
        self.owner = gl.message.sender_address
        self.report_nonce = u256(1)
        self.protocol_count = u256(0)

    # -------------------------------------------------------------------------
    # Internal Helpers
    # -------------------------------------------------------------------------

    def _make_key(self, chain_id: str, target_address: str) -> str:
        return chain_id.strip().lower() + ":" + target_address.strip().lower()

    # -------------------------------------------------------------------------
    # Public View Methods (Instant, deterministic reads)
    # -------------------------------------------------------------------------

    @gl.public.view
    def is_halted(self, target_address: str) -> bool:
        """
        Primary Circuit Breaker Hook:
        Downstream DeFi vaults (on Base, Arbitrum, or GenLayer) query this method.
        Returns True if the contract is in EMERGENCY HALT state.
        """
        addr_clean = target_address.strip().lower()
        if addr_clean in self.halted_status:
            return self.halted_status[addr_clean]
        return False

    @gl.public.view
    def get_protocol(self, chain_id: str, target_address: str) -> dict:
        """Returns the registered protocol configuration and current health."""
        key = self._make_key(chain_id, target_address)
        if key not in self.protocols:
            return {"registered": False}
        data = json.loads(self.protocols[key])
        addr_clean = target_address.strip().lower()
        data["is_halted"] = self.halted_status.get(addr_clean, False)
        return data

    @gl.public.view
    def get_report(self, report_id: str) -> dict:
        """Returns details of a specific exploit adjudication report."""
        if report_id not in self.reports:
            return {"exists": False}
        return json.loads(self.reports[report_id])

    @gl.public.view
    def get_whitehat_reward(self, whitehat_address: Address) -> u256:
        """Returns total bounty rewards credited to a whitehat reporter."""
        if whitehat_address in self.whitehat_rewards:
            return self.whitehat_rewards[whitehat_address]
        return u256(0)

    @gl.public.view
    def get_system_stats(self) -> dict:
        """Returns aggregated protocol metrics."""
        return {
            "owner": str(self.owner),
            "report_nonce": int(self.report_nonce),
            "protocol_count": int(self.protocol_count),
        }

    # -------------------------------------------------------------------------
    # Public State-Modifying Methods
    # -------------------------------------------------------------------------

    @gl.public.write
    def register_protocol(
        self,
        chain_id: str,
        target_address: str,
        protocol_name: str,
        bounty_pool_atto: u256,
    ) -> str:
        """
        Registers a protocol under WhitehatAI active circuit-breaker surveillance.
        Can be called by any protocol DAO, vault deployer, or security guardian.
        """
        chain_clean = chain_id.strip().lower()
        addr_clean = target_address.strip().lower()
        key = self._make_key(chain_clean, addr_clean)

        record = {
            "registered": True,
            "chain_id": chain_clean,
            "target_address": addr_clean,
            "protocol_name": protocol_name.strip(),
            "is_halted": False,
            "halt_count": 0,
            "bounty_pool": int(bounty_pool_atto),
            "last_halt_reason": "",
            "guardian": str(gl.message.sender_address),
        }

        self.protocols[key] = json.dumps(record, sort_keys=True)
        self.target_to_chain[addr_clean] = chain_clean
        self.halted_status[addr_clean] = False
        self.protocol_count = self.protocol_count + u256(1)

        return "PROTOCOL_REGISTERED:" + key

    @gl.public.write
    def submit_exploit_report(
        self,
        chain_id: str,
        target_address: str,
        evidence_url: str,
        attack_type: str,
        attack_summary: str,
    ) -> str:
        """
        Permissionless Threat Reporting:
        A whitehat or automated monitoring bot flags a potential exploit on Base/Arbitrum/Ethereum.
        GenLayer validators independently fetch the transaction receipt or security advisory from the web,
        analyze the exploit trace with LLM comparative consensus, and trigger the emergency circuit breaker.
        """
        chain_clean = chain_id.strip().lower()
        addr_clean = target_address.strip().lower()
        proto_key = self._make_key(chain_clean, addr_clean)

        # 1. Pre-extract storage attributes into pure local Python primitives (CRITICAL RULE #1)
        is_registered = proto_key in self.protocols
        protocol_name = "External Vault"
        current_bounty = 0
        if is_registered:
            loaded = json.loads(self.protocols[proto_key])
            protocol_name = loaded.get("protocol_name", "Target Protocol")
            current_bounty = loaded.get("bounty_pool", 0)

        current_report_id = "SZ-" + str(int(self.report_nonce))
        sender_str = str(gl.message.sender_address)
        target_repr = addr_clean
        chain_repr = chain_clean
        ev_url = evidence_url.strip()
        att_type = attack_type.strip()
        att_sum = attack_summary.strip()

        # 2. Define non-deterministic evaluation closure (NO self calls inside!)
        def leader() -> str:
            # Defensive web fetch with graceful fallback
            evidence_text = "[No external web link provided - evaluating based on submitted attack telemetry]"
            if ev_url != "" and (ev_url.startswith("http://") or ev_url.startswith("https://")):
                try:
                    fetched = gl.nondet.get_web_page(ev_url)
                    if fetched and len(fetched) > 0:
                        # Slice to first 3000 chars to avoid token blowout
                        evidence_text = fetched[:3000]
                except Exception:
                    evidence_text = "[Evidence link fetch unreachable or blocked - fallback to text evaluation]"

            prompt = (
                "You are an expert Autonomous Security Validator on GenLayer guarding DeFi protocols.\\n"
                "Review the following security exploit alert submitted for a target protocol.\\n\\n"
                "TARGET METADATA:\\n"
                "- Chain: " + chain_repr + "\\n"
                "- Protocol Name: " + protocol_name + "\\n"
                "- Target Address: " + target_repr + "\\n"
                "- Attack Type: " + att_type + "\\n"
                "- Reporter Attack Summary: " + att_sum + "\\n"
                "- Evidence Source: " + ev_url + "\\n\\n"
                "INDEPENDENT WEB EVIDENCE CONTEXT:\\n"
                + evidence_text + "\\n\\n"
                "DETERMINATION REQUIREMENTS:\\n"
                "1. Is there plausible or verified evidence of an active smart contract vulnerability, "
                "unauthorized drain, malicious reentrancy, or exploit trace?\\n"
                "2. Assign an action:\\n"
                "   - 'EMERGENCY_HALT': If evidence points to an active exploit, drained funds, or critical threat.\\n"
                "   - 'DISMISS_FALSE_ALARM': If this is routine arbitrage, normal trade volume, or invalid griefing report.\\n"
                "3. Severity must be: 'CRITICAL', 'HIGH', 'MEDIUM', or 'NONE'.\\n\\n"
                "Respond ONLY in valid JSON with this schema:\\n"
                "{\\n"
                '  "action": "EMERGENCY_HALT" | "DISMISS_FALSE_ALARM",\\n'
                '  "exploit_detected": true | false,\\n'
                '  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "NONE",\\n'
                '  "confidence": 0-100,\\n'
                '  "rationale": "<concise 1-sentence forensic summary>"\\n'
                "}"
            )

            raw_res = gl.nondet.exec_prompt(prompt, response_format="json")
            try:
                parsed = json.loads(raw_res)
                action = parsed.get("action", "DISMISS_FALSE_ALARM")
                if action not in ["EMERGENCY_HALT", "DISMISS_FALSE_ALARM"]:
                    action = "EMERGENCY_HALT" if parsed.get("exploit_detected", False) else "DISMISS_FALSE_ALARM"

                normalized = {
                    "action": action,
                    "exploit_detected": bool(parsed.get("exploit_detected", False)),
                    "severity": str(parsed.get("severity", "NONE")),
                    "rationale": str(parsed.get("rationale", "Forensic adjudication completed.")),
                }
                return json.dumps(normalized, sort_keys=True)
            except Exception:
                # Ultimate fallback
                fallback_action = "EMERGENCY_HALT" if "drain" in att_sum.lower() or "exploit" in att_sum.lower() else "DISMISS_FALSE_ALARM"
                return json.dumps({
                    "action": fallback_action,
                    "exploit_detected": fallback_action == "EMERGENCY_HALT",
                    "severity": "HIGH" if fallback_action == "EMERGENCY_HALT" else "NONE",
                    "rationale": "Automated defensive triage applied.",
                }, sort_keys=True)

        # 3. Equivalence Principle Consensus across validators
        comparative_instruction = (
            "Determine if validators agree on the core outcome. "
            "They match if both assign 'action' as 'EMERGENCY_HALT' and confirm 'exploit_detected' as true, "
            "OR both assign 'action' as 'DISMISS_FALSE_ALARM' and 'exploit_detected' as false. "
            "Minor wording variations in rationale or confidence scores must NOT prevent consensus."
        )

        consensus_raw = gl.eq_principle.prompt_comparative(leader, comparative_instruction)
        verdict = json.loads(consensus_raw)

        # 4. State updates based on decentralized consensus
        action = verdict.get("action", "DISMISS_FALSE_ALARM")
        is_halt = action == "EMERGENCY_HALT"
        severity = verdict.get("severity", "CRITICAL" if is_halt else "NONE")
        rationale = verdict.get("rationale", "Consensus reached.")

        # Update protocol halt status if confirmed
        bounty_awarded = u256(0)
        if is_halt:
            self.halted_status[addr_clean] = True

            # If registered, update record statistics
            if is_registered:
                loaded = json.loads(self.protocols[proto_key])
                loaded["is_halted"] = True
                loaded["halt_count"] = loaded.get("halt_count", 0) + 1
                loaded["last_halt_reason"] = rationale
                # Award 50% of bounty pool to whitehat
                if current_bounty > 0:
                    award = current_bounty // 2
                    bounty_awarded = u256(award)
                    loaded["bounty_pool"] = current_bounty - award
                    sender_acc = gl.message.sender_address
                    existing_reward = self.whitehat_rewards.get(sender_acc, u256(0))
                    self.whitehat_rewards[sender_acc] = existing_reward + bounty_awarded

                self.protocols[proto_key] = json.dumps(loaded, sort_keys=True)
            else:
                # Unregistered contract still gets recorded in halt registry for cross-chain queries
                self.target_to_chain[addr_clean] = chain_clean

        # Record report details
        report_record = {
            "report_id": current_report_id,
            "chain_id": chain_clean,
            "target_address": addr_clean,
            "protocol_name": protocol_name,
            "reporter": sender_str,
            "evidence_url": ev_url,
            "attack_type": att_type,
            "attack_summary": att_sum,
            "action": action,
            "is_halt": is_halt,
            "severity": severity,
            "rationale": rationale,
            "bounty_awarded": int(bounty_awarded),
            "status": "CIRCUIT_BREAKER_TRIGGERED" if is_halt else "FALSE_ALARM_DISMISSED",
        }

        self.reports[current_report_id] = json.dumps(report_record, sort_keys=True)
        self.report_nonce = self.report_nonce + u256(1)

        return current_report_id + ":" + action

    @gl.public.write
    def lift_emergency_halt(self, chain_id: str, target_address: str, authorization_proof: str) -> str:
        """
        Authorized Recovery:
        Allows protocol guardian or owner to restore normal operations
        after vulnerability remediation and safety verification.
        """
        chain_clean = chain_id.strip().lower()
        addr_clean = target_address.strip().lower()
        proto_key = self._make_key(chain_clean, addr_clean)

        sender = gl.message.sender_address
        is_authorized = False

        if sender == self.owner:
            is_authorized = True
        elif proto_key in self.protocols:
            loaded = json.loads(self.protocols[proto_key])
            if loaded.get("guardian", "") == str(sender):
                is_authorized = True

        if not is_authorized:
            raise gl.UserError("Unauthorized: Only protocol guardian or contract owner can lift emergency halt.")

        self.halted_status[addr_clean] = False

        if proto_key in self.protocols:
            loaded = json.loads(self.protocols[proto_key])
            loaded["is_halted"] = False
            loaded["recovery_proof"] = authorization_proof.strip()
            self.protocols[proto_key] = json.dumps(loaded, sort_keys=True)

        return "HALT_LIFTED:" + proto_key


# Backward compatibility alias
SentinelZero = WhitehatAI
