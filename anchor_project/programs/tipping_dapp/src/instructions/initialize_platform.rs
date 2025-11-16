use crate::state::global_state::GlobalState;
use anchor_lang::prelude::*;

pub fn handler(ctx: Context<InitializePlatform>) -> Result<()> {
    let state = &mut ctx.accounts.global_state;

    state.admin = ctx.accounts.admin.key();
    state.total_sol_tipped = 0;
    state.total_spl_tipped = 0;
    // state.bump = 0;
    state.bump = ctx.bumps.global_state;

    Ok(())
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + GlobalState::INIT_SPACE,
        seeds = ["global-state".as_bytes()],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}
