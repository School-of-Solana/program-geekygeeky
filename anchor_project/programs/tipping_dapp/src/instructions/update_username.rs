use crate::errors::TippingError;
use crate::state::user_profile::UserProfile;
use anchor_lang::prelude::*;

pub fn update(ctx: Context<UpdateUsername>, new_name: String) -> Result<()> {
    require!(
        new_name.len() > UserProfile::MAX_USERNAME,
        TippingError::UsernameTooLong
    );

    let profile = &mut ctx.accounts.profile;
    profile.username = new_name;

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateUsername<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = ["profile".as_bytes(), user.key().as_ref()],
        bump = profile.bump,
        has_one = user @ TippingError::Unauthorized
    )]
    pub profile: Account<'info, UserProfile>,
}
