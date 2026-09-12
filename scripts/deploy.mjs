import { readFile, writeFile, mkdir } from "node:fs/promises";
import crypto from "node:crypto";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

async function main() {
  process.stdout.write("====================================================\n");
  process.stdout.write("   WhitehatAI — GenLayer StudioNet Deployment       \n");
  process.stdout.write("====================================================\n\n");

  let rawKey = process.env.DEPLOYER_PRIVATE_KEY?.trim();
  if (!rawKey) {
    // Default to the known funded StudioNet developer account if not specified
    rawKey = "0x900671616aea6cebf2a7f1f3f0fd81d89cf0b544db785b4b455a7b71a3c86044";
  }
  const account = createAccount(rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`);
  process.stdout.write(`Deployer Account: ${account.address}\n`);

  const client = createClient({ chain: studionet, account });
  const contractPath = new URL("../contracts/SentinelZero.py", import.meta.url);
  const code = await readFile(contractPath, "utf8");

  process.stdout.write("Submitting WhitehatAI contract deployment to StudioNet...\n");
  const hash = await client.deployContract({
    code,
    args: [],
  });

  process.stdout.write(`Transaction Hash: ${hash}\n`);
  process.stdout.write("Waiting for FINALIZED consensus status from GenLayer validators...\n");

  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 2500,
    retries: 300,
  });

  const contractAddress =
    receipt.data?.contract_address ||
    receipt.contractAddress ||
    receipt.contract_address ||
    receipt.data?.contractAddress;

  if (!contractAddress) {
    throw new Error("Failed to extract deployed contract address from receipt: " + JSON.stringify(receipt));
  }

  process.stdout.write("\n====================================================\n");
  process.stdout.write("         Deployment Finalized Successfully!         \n");
  process.stdout.write("====================================================\n");
  process.stdout.write(`Contract Address: ${contractAddress}\n`);
  process.stdout.write(`Explorer URL:     https://explorer-studio.genlayer.com/address/${contractAddress}\n`);
  process.stdout.write(`Studio Import:    https://studio.genlayer.com/?import-contract=${contractAddress}\n\n`);

  const envContent = [
    `NEXT_PUBLIC_GENLAYER_NETWORK=studionet`,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`,
    `NEXT_PUBLIC_DEPLOYER_ADDRESS=${account.address}`,
    `NEXT_PUBLIC_EXPLORER_BASE=https://explorer-studio.genlayer.com/address/`,
    `NEXT_PUBLIC_STUDIO_BASE=https://studio.genlayer.com/?import-contract=`,
    `DEPLOYER_PRIVATE_KEY=${rawKey}`,
  ].join("\n") + "\n";

  await writeFile(new URL("../.env", import.meta.url), envContent, "utf8");
  await writeFile(new URL("../.env.local", import.meta.url), envContent, "utf8");

  const deploymentData = {
    network: "studionet",
    contractAddress,
    deployerAddress: account.address,
    transactionHash: hash,
    deployedAt: new Date().toISOString(),
    receipt,
  };

  await mkdir(new URL("../.deployment", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../.deployment/deployment.json", import.meta.url),
    JSON.stringify(deploymentData, null, 2),
    "utf8"
  );

  process.stdout.write("Saved config to .env, .env.local, and .deployment/deployment.json\n");
}

main().catch((err) => {
  process.stderr.write(`Deployment failed: ${err.message || err}\n`);
  process.exit(1);
});
