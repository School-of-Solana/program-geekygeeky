use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalState {
    pub admin: Pubkey,
    pub total_sol_tipped: u64,
    pub total_spl_tipped: u64,
    pub bump: u8,
}
