import { readFile, writeFile } from "node:fs/promises";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

async function main() {
  process.stdout.write("====================================================\n");
  process.stdout.write("  SentinelZero — Live StudioNet Transaction Runner  \n");
  process.stdout.write("====================================================\n\n");

  const deploymentRaw = await readFile(new URL("../.deployment/deployment.json", import.meta.url), "utf8");
  const deployment = JSON.parse(deploymentRaw);
  const contractAddress = deployment.contractAddress;
  const rawKey = deployment.operatorPrivateKey || process.env.DEPLOYER_PRIVATE_KEY || "0x900671616aea6cebf2a7f1f3f0fd81d89cf0b544db785b4b455a7b71a3c86044";
  const account = createAccount(rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`);

  process.stdout.write(`Target Contract: ${contractAddress}\n`);
  process.stdout.write(`Caller Account:  ${account.address}\n\n`);

  const client = createClient({ chain: studionet, account });

  // 1. Check initial stats
  process.stdout.write("1. Reading initial system stats...\n");
  const initialStats = await client.readContract({
    address: contractAddress,
    functionName: "get_system_stats",
    args: [],
  });
  process.stdout.write(`Initial Stats: ${JSON.stringify(initialStats, null, 2)}\n\n`);

  // 2. Register Base Protocol: Aerodrome Slipstream Vault
  process.stdout.write("2. Registering Base Protocol: Aerodrome Slipstream Vault...\n");
  const regTx1 = await client.writeContract({
    address: contractAddress,
    functionName: "register_protocol",
    args: [
      "base",
      "0x49520a0a55A44b1c8f8b1dF26e033A18d9F6b84E",
      "Aerodrome Slipstream Vault",
      25000000000000000000000n, // 25,000 ETH/Tokens bounty pool
    ],
  });
  process.stdout.write(`Submitted regTx1: ${regTx1}\nWaiting for finality...\n`);
  const receipt1 = await client.waitForTransactionReceipt({
    hash: regTx1,
    status: TransactionStatus.FINALIZED,
    interval: 2500,
    retries: 200,
  });
  process.stdout.write(`regTx1 Finalized! Status: ${receipt1.status}\n\n`);

  // 3. Register Arbitrum Protocol: GMX V2 Liquidity Pool
  process.stdout.write("3. Registering Arbitrum Protocol: GMX V2 Liquidity Pool...\n");
  const regTx2 = await client.writeContract({
    address: contractAddress,
    functionName: "register_protocol",
    args: [
      "arbitrum",
      "0x8432aE65c3Ec976451eAfC00dFc458bC9975E61C",
      "GMX V2 Liquidity Pool (GLV)",
      50000000000000000000000n,
    ],
  });
  process.stdout.write(`Submitted regTx2: ${regTx2}\nWaiting for finality...\n`);
  const receipt2 = await client.waitForTransactionReceipt({
    hash: regTx2,
    status: TransactionStatus.FINALIZED,
    interval: 2500,
    retries: 200,
  });
  process.stdout.write(`regTx2 Finalized! Status: ${receipt2.status}\n\n`);

  // 4. Submit Exploit Report: Flash Loan Reentrancy on Base
  process.stdout.write("4. Submitting Exploit Report (Real AI Consensus on Web Evidence)...\n");
  const exploitTx = await client.writeContract({
    address: contractAddress,
    functionName: "submit_exploit_report",
    args: [
      "base",
      "0x49520a0a55A44b1c8f8b1dF26e033A18d9F6b84E",
      "https://basescan.org/tx/0x918fca201e7492c10972b22037cb84918e9c0b55338c51bd5555e4276f5add0f",
      "Flash Loan Reentrancy Drain",
      "Attacker flash borrowed 4,200 WETH and reentered reserve pools before balance reconciliation, siphoning $3.4M.",
    ],
  });
  process.stdout.write(`Submitted exploitTx: ${exploitTx}\n`);
  process.stdout.write("GenLayer Validators now fetching web evidence, comparing LLM determinations & voting...\n");
  const exploitReceipt = await client.waitForTransactionReceipt({
    hash: exploitTx,
    status: TransactionStatus.FINALIZED,
    interval: 3000,
    retries: 300,
  });
  process.stdout.write(`exploitTx Finalized! Status: ${exploitReceipt.status}\n`);
  process.stdout.write(`Consensus Votes: ${JSON.stringify(exploitReceipt.consensus_data?.votes || {}, null, 2)}\n\n`);

  // 5. Query Circuit Breaker View Status
  process.stdout.write("5. Querying live Circuit Breaker status on-chain...\n");
  const isHalted = await client.readContract({
    address: contractAddress,
    functionName: "is_halted",
    args: ["0x49520a0a55A44b1c8f8b1dF26e033A18d9F6b84E"],
  });
  process.stdout.write(`is_halted("0x49520a..."): ${isHalted}\n`);

  const protoRecord = await client.readContract({
    address: contractAddress,
    functionName: "get_protocol",
    args: ["base", "0x49520a0a55A44b1c8f8b1dF26e033A18d9F6b84E"],
  });
  process.stdout.write(`get_protocol: ${JSON.stringify(protoRecord, null, 2)}\n`);

  const report1 = await client.readContract({
    address: contractAddress,
    functionName: "get_report",
    args: ["SZ-1"],
  });
  process.stdout.write(`get_report("SZ-1"): ${JSON.stringify(report1, null, 2)}\n\n`);

  // Save all live state
  const liveState = {
    contractAddress,
    network: "studionet",
    lastUpdated: new Date().toISOString(),
    registrationTx1: { hash: regTx1, receipt: receipt1 },
    registrationTx2: { hash: regTx2, receipt: receipt2 },
    exploitAdjudicationTx: { hash: exploitTx, receipt: exploitReceipt },
    onchainStatus: {
      isHalted,
      protocolRecord: protoRecord,
      report1,
    },
  };

  await writeFile(
    new URL("../.deployment/live_chain_state.json", import.meta.url),
    JSON.stringify(liveState, null, 2),
    "utf8"
  );
  process.stdout.write("Successfully saved live chain verification state to .deployment/live_chain_state.json!\n");
}

main().catch((err) => {
  process.stderr.write(`Execution failed: ${err.message || err}\n`);
  process.exit(1);
});
