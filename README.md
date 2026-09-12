# WhitehatAI: Autonomous Cross-Chain Emergency Circuit Breaker

[![GenLayer StudioNet](https://img.shields.io/badge/GenLayer-StudioNet-cyan?style=for-the-badge)](https://explorer-studio.genlayer.com)
[![Track](https://img.shields.io/badge/Track-Autonomous%20Protocols-red?style=for-the-badge)](https://portal.genlayer.foundation/agent-tank/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> *"Build on Base / Arbitrum / Ethereum. Adjudicate & Auto-Halt on GenLayer."*

**WhitehatAI** is an autonomous emergency circuit breaker protocol built for the **GenLayer Agent Tank Hackathon (Autonomous Protocols Track)**.

When a smart contract exploit, reentrancy drain, or oracle manipulation is detected across **Base**, **Arbitrum**, or **Ethereum**, WhitehatAI uses GenLayer’s web-connected AI validators to independently fetch block explorer traces, evaluate the threat through multi-model LLM consensus (`gl.eq_principle.prompt_comparative`), and **autonomously trigger an emergency pause** with zero human lag.

---

## 🎯 Hackathon Positioning & The Pioneer Advantage

Under the **Autonomous Protocols** track, the GenLayer Hackathon Portal explicitly states:
> *"Ideas we want built: **Emergency halt module. Pauses a target contract when anyone proves an active exploit.**"*  
> *"Live in the ecosystem: **No live project yet. The first team here sets the reference.**"*

WhitehatAI is the **exact, word-for-word architecture** GenLayer requested. As the first project in this track, it sets the standard for self-running autonomous safety protocols.

---

## ⚡ Cross-Chain Architecture

```
   [ TARGET PROTOCOL ON BASE / ARBITRUM / ETHEREUM ]
   (Yield Vault, Lending Market, DEX Liquidity Pool)
                         |
      (1) Anomaly or     |
          Exploit Occurs |  (e.g., Flash loan drain on Base)
                         v
   +------------------------------------------------------------------+
   |          WHITEHAT / WATCHER BOT SUBMITS REPORT                   |
   |   `submit_exploit_report(chain, target, tx_hash/url, summary)`   |
   +------------------------------------------------------------------+
                         |
                         v
   +------------------------------------------------------------------+
   |               WHITEHAT AI ON GENLAYER                            |
   |                                                                  |
   |  (2) Validators fetch live receipt from Basescan / Etherscan    |
   |  (3) Multi-LLM consensus (Claude 3.5, GPT-5.4, Gemini 3 Flash)  |
   |      evaluates unauthorized state drain against protocol math    |
   |  (4) Quorum agreed: 'action': 'EMERGENCY_HALT'                  |
   |  (5) Autonomous state update: `halted_status[target] = True`    |
   |  (6) Whitehat reward credited from security bounty pool          |
   +------------------------------------------------------------------+
                         |
                         v
   [ BASE / ARBITRUM RELAYER OR VAULT HOOK TRIPPED ]
   - Target vault queries `WhitehatAI.is_halted(target_address)`
   - Withdrawals / borrows instantly frozen
   - Remaining protocol liquidity saved!
```

---

## 🛡️ Mandatory Post-Development Audit (Crucible V2)

| Audit Check | Status | Verification Detail |
|---|---|---|
| **1. Storage Pre-Extraction** | ✅ **PASSED** | All storage state (`protocols`, `bounties`, `nonces`) is pre-extracted into pure Python primitives before entering `leader()` closure. Zero `self.` calls in non-deterministic blocks. |
| **2. Pinned Runner Dependency** | ✅ **PASSED** | Contract pins `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }` on line 1. |
| **3. Fallback & Zero-Revert** | ✅ **PASSED** | Web fetching implements defensive try/catch with graceful text fallbacks to prevent transaction reverts on network hiccups. |
| **4. Equivalence Consensus** | ✅ **PASSED** | Uses `gl.eq_principle.prompt_comparative` focusing on substantive actions (`EMERGENCY_HALT` vs. `DISMISS_FALSE_ALARM`) and severity tiers. |
| **5. AST & SDK Linting** | ✅ **PASSED** | `genvm-lint check` passed with exit code 0 (0 errors, 0 forbidden imports). |
| **6. Live Chain Adjudication** | ✅ **PASSED** | Deployed on GenLayer StudioNet with live transaction validation. |

---

## 💻 3-Line Integration Guide for DeFi Protocols

Any Solidity smart contract on Base, Arbitrum, or Ethereum can query WhitehatAI:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IWhitehatAI {
    function is_halted(address target) external view returns (bool);
}

contract ProtectedVault {
    IWhitehatAI public constant WHITEHAT = IWhitehatAI(0xA38Ab4F28062721c19ea1cB4052F24aaB19d3C4F);

    modifier onlyWhenSecure() {
        require(!WHITEHAT.is_halted(address(this)), "CIRCUIT_BREAKER_ACTIVE: Protocol is in Emergency Halt!");
        _;
    }

    function withdraw(uint256 amount) external onlyWhenSecure {
        // Protected withdrawal logic
    }
}
```

---

## 🚀 Quickstart & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the interactive Threat Radar and Judge Simulator.

### 3. Lint Contract with GenVM
```bash
genvm-lint check contracts/SentinelZero.py --json
```

### 4. Deploy to GenLayer StudioNet
```bash
npm run deploy:studionet
```

---

## 📜 License
MIT © 2026 WhitehatAI Team
