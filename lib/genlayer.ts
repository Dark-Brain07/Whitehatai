import { createClient, createAccount } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

export const GENLAYER_NETWORK = process.env.NEXT_PUBLIC_GENLAYER_NETWORK || 'studionet';
export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xA38Ab4F28062721c19ea1cB4052F24aaB19d3C4F';
export const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_EXPLORER_BASE || 'https://explorer-studio.genlayer.com/address/';

export function getExplorerUrl(addressOrTx: string): string {
  if (addressOrTx.startsWith('0x') && addressOrTx.length === 66) {
    return `https://explorer-studio.genlayer.com/tx/${addressOrTx}`;
  }
  return `${EXPLORER_BASE}${addressOrTx}`;
}

export function getGenLayerClient() {
  try {
    const rawKey = process.env.DEPLOYER_PRIVATE_KEY?.trim() || '0x900671616aea6cebf2a7f1f3f0fd81d89cf0b544db785b4b455a7b71a3c86044';
    const formattedKey = (rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`) as `0x${string}`;
    const account = createAccount(formattedKey);
    return createClient({ chain: studionet, account });
  } catch {
    return null;
  }
}
