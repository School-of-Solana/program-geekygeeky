use anchor_lang::prelude::*;

#[error_code]
pub enum TippingError {
    #[msg("Username too long")]
    UsernameTooLong,

    #[msg("Message too long")]
    MessageTooLong,

    #[msg("Profile already exists")]
    ProfileExists,

    #[msg("Recipient does not exist")]
    ProfileNotExists,

    #[msg("Tip stats already exist")]
    TipStatsExists,

    #[msg("Unauthorized action")]
    Unauthorized,

    #[msg("Invalid SPL token mint")]
    InvalidMint,

    #[msg("Insufficient lamports")]
    InsufficientLamports,
}
