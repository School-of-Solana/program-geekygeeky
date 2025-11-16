use crate::errors::TippingError;
use crate::state::{tip_stats::TipStats, user_profile::UserProfile};
use anchor_lang::prelude::*;
// use anchor_spl::token::Mint;
use anchor_spl::token_interface::Mint;

pub fn create(ctx: Context<CreateProfile>, username: String) -> Result<()> {
    require!(
        username.len() <= UserProfile::MAX_USERNAME,
        TippingError::UsernameTooLong
    );

    // Initialize profile PDA
    let profile = &mut ctx.accounts.profile;
    profile.user = ctx.accounts.user.key();
    profile.username = username;
    profile.bump = ctx.bumps.profile;

    // Initialize stats PDA
    let stats = &mut ctx.accounts.stats;
    stats.user = ctx.accounts.user.key();
    stats.total_sol_received = 0;
    stats.total_spl_received = 0;
    stats.spl_mint = ctx.accounts.spl_mint.key();
    stats.last_message = "".to_string();
    stats.bump = ctx.bumps.stats;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateProfile<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = ["profile".as_bytes(), user.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, UserProfile>,

    #[account(
        init,
        payer = user,
        space = 8 + TipStats::INIT_SPACE,
        seeds = ["stats".as_bytes(), user.key().as_ref()],
        bump
    )]
    pub stats: Account<'info, TipStats>,

    /// The SPL token mint this profile tracks (USDC, BONK, etc.)
    // #[account(mut)]
    pub spl_mint: InterfaceAccount<'info, Mint>,

    // pub mint: InterfaceAccount<'info, Mint>,
    pub system_program: Program<'info, System>,
}
