use crate::errors::TippingError;
use crate::state::{global_state::GlobalState, tip_stats::TipStats};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

pub fn tip_spl(ctx: Context<SendSplTip>, amount: u64, message: String) -> Result<()> {
    require!(
        message.len() <= TipStats::MAX_MESSAGE,
        TippingError::MessageTooLong
    );

    // Validate mint
    if ctx.accounts.token_mint.key() != ctx.accounts.recipient_stats.spl_mint {
        return Err(error!(TippingError::InvalidMint));
    }

    // SPL Transfer
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.tipper_ata.to_account_info(),
            to: ctx.accounts.recipient_ata.to_account_info(),
            authority: ctx.accounts.tipper.to_account_info(),
        },
    );
    token::transfer(cpi_ctx, amount)?;

    // Update Stats
    let stats = &mut ctx.accounts.recipient_stats;
    stats.total_spl_received += amount;
    stats.last_message = message;

    // Global stats
    let global = &mut ctx.accounts.global_state;
    global.total_spl_tipped += amount;

    Ok(())
}

#[derive(Accounts)]
pub struct SendSplTip<'info> {
    #[account(mut)]
    pub tipper: Signer<'info>,

    /// Tipper token account
    #[account(mut)]
    pub tipper_ata: Account<'info, TokenAccount>,

    /// Recipient token account
    #[account(mut)]
    pub recipient_ata: Account<'info, TokenAccount>,

    /// CHECK: recipient is any user wallet
    #[account(mut)]
    pub recipient: AccountInfo<'info>,

    /// SPL token mint used for tipping
    pub token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,

    #[account(
        mut,
        seeds = ["stats".as_bytes(), recipient.key().as_ref()],
        bump = recipient_stats.bump
    )]
    pub recipient_stats: Account<'info, TipStats>,

    #[account(
        mut,
        seeds = ["global-state".as_bytes()],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
}
