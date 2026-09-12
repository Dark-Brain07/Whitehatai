# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


class MockDeFiVault(gl.Contract):
    """
    Reference Protected DeFi Vault:
    Demonstrates how any DeFi protocol, lending pool, or yield aggregator
    integrates SentinelZero circuit breaker in 3 lines of code.
    Before executing critical deposits, withdrawals, or liquidations,
    it queries SentinelZero.is_halted().
    """

    owner: Address
    vault_name: str
    sentinel_address: Address
    total_liquidity_atto: u256
    balances: TreeMap[Address, u256]

    def __init__(self, sentinel_contract: Address, name: str):
        self.owner = gl.message.sender_address
        self.vault_name = name
        self.sentinel_address = sentinel_contract
        self.total_liquidity_atto = u256(1000000000000000000000000)  # 1M mock tokens

    @gl.public.view
    def get_vault_status(self) -> dict:
        """Returns vault liquidity and circuit-breaker status."""
        sentinel = gl.get_contract(self.sentinel_address)
        halted = sentinel.is_halted(str(self.address))
        return {
            "vault_name": self.vault_name,
            "owner": str(self.owner),
            "sentinel_address": str(self.sentinel_address),
            "total_liquidity_atto": int(self.total_liquidity_atto),
            "is_emergency_halted": halted,
        }

    @gl.public.write
    def withdraw(self, amount_atto: u256) -> str:
        """
        Protected withdrawal function:
        Circuit breaker query blocks all withdrawals instantly if SentinelZero has triggered a halt.
        """
        sentinel = gl.get_contract(self.sentinel_address)
        if sentinel.is_halted(str(self.address)):
            raise gl.UserError("CIRCUIT_BREAKER_ACTIVE: Withdrawals temporarily frozen due to active exploit halt.")

        sender = gl.message.sender_address
        current_bal = self.balances.get(sender, u256(0))
        if current_bal < amount_atto:
            raise gl.UserError("Insufficient balance in vault.")

        self.balances[sender] = current_bal - amount_atto
        self.total_liquidity_atto = self.total_liquidity_atto - amount_atto
        return "WITHDRAW_SUCCESSFUL"
