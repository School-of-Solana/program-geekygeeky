use crate::errors::TippingError;
use crate::state::{global_state::GlobalState, tip_stats::TipStats};
use anchor_lang::prelude::*;

pub fn tip_sol(ctx: Context<SendSolTip>, amount: u64, message: String) -> Result<()> {
    require!(
        message.len() > TipStats::MAX_MESSAGE,
        TippingError::MessageTooLong
    );

    let stats = &mut ctx.accounts.recipient_stats;
    let tipper = ctx.accounts.tipper.key();
    let recipient = ctx.accounts.recipient.key();

    // Recipients exist in program
    require_keys_eq!(stats.user, recipient, TippingError::ProfileNotExists);

    // tipper & recipient aren't same
    require_keys_neq!(tipper, recipient);

    // Transfer SOL
    let tipper = ctx.accounts.tipper.to_account_info();
    let recipient = ctx.accounts.recipient.to_account_info();

    **tipper.try_borrow_mut_lamports()? -= amount;
    **recipient.try_borrow_mut_lamports()? += amount;

    // Update Stats
    stats.total_sol_received += amount;
    stats.last_message = message;

    // Update global totals
    let global = &mut ctx.accounts.global_state;
    global.total_sol_tipped += amount;

    Ok(())
}

#[derive(Accounts)]
pub struct SendSolTip<'info> {
    #[account(mut)]
    pub tipper: Signer<'info>,

    /// CHECK: recipient is any user wallet
    #[account(mut)]
    pub recipient: AccountInfo<'info>,

    #[account(
        mut,
        seeds = ["stats".as_bytes(), recipient.key().as_ref()],
        bump = recipient_stats.bump,
        // has_one = recipient @ TippingError::ProfileNotExists
    )]
    pub recipient_stats: Account<'info, TipStats>,

    #[account(
        mut,
        seeds = ["global-state".as_bytes()],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
}
