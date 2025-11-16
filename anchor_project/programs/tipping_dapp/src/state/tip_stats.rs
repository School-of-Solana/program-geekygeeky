use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TipStats {
    pub user: Pubkey,
    pub total_sol_received: u64,
    pub total_spl_received: u64,
    pub spl_mint: Pubkey,
    #[max_len(80)]
    pub last_message: String,
    pub bump: u8,
}