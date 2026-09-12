import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { createAccount, createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

export async function GET() {
  try {
    const liveRaw = await readFile(new URL('../../../.deployment/live_chain_state.json', import.meta.url), 'utf8');
    const liveState = JSON.parse(liveRaw);

    // Also attempt fresh live on-chain reads
    try {
      const deploymentRaw = await readFile(new URL('../../../.deployment/deployment.json', import.meta.url), 'utf8');
      const deployment = JSON.parse(deploymentRaw);
      const contractAddress = deployment.contractAddress;
      const rawKey = deployment.operatorPrivateKey || '0x900671616aea6cebf2a7f1f3f0fd81d89cf0b544db785b4b455a7b71a3c86044';
      const account = createAccount(rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`);
      const client = createClient({ chain: studionet, account });

      const stats = await client.readContract({
        address: contractAddress,
        functionName: 'get_system_stats',
        args: [],
      });

      const isBaseHalted = await client.readContract({
        address: contractAddress,
        functionName: 'is_halted',
        args: ['0x49520a0a55A44b1c8f8b1dF26e033A18d9F6b84E'],
      });

      const baseProto = await client.readContract({
        address: contractAddress,
        functionName: 'get_protocol',
        args: ['base', '0x49520a0a55A44b1c8f8b1dF26e033A18d9F6b84E'],
      });

      const arbProto = await client.readContract({
        address: contractAddress,
        functionName: 'get_protocol',
        args: ['arbitrum', '0x8432aE65c3Ec976451eAfC00dFc458bC9975E61C'],
      });

      return NextResponse.json({
        ok: true,
        contractAddress,
        stats,
        isBaseHalted,
        protocols: [baseProto, arbProto],
        liveState,
      });
    } catch (readErr: any) {
      // Return cached liveState if RPC latency
      return NextResponse.json({
        ok: true,
        cached: true,
        liveState,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
