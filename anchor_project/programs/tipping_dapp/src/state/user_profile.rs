use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub user: Pubkey,
    #[max_len(20)]
    pub username: String,
    pub bump: u8,
}

impl UserProfile {
    pub const MAX_USERNAME: usize = 20;
}

