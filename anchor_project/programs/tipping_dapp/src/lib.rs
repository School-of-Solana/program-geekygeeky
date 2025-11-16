use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use crate::instructions::*;

declare_id!("2vWCcBBsaLgEituJTJnvADGGQamSMqGakos2fPAfdrYk");

#[program]
pub mod anchor_project {

    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatform>) -> Result<()> {
        initialize_platform::handler(ctx)
    }

    pub fn create_profile(ctx: Context<CreateProfile>, username: String) -> Result<()> {
        create_profile::create(ctx, username)
    }

    pub fn update_username(ctx: Context<UpdateUsername>, username: String) -> Result<()> {
        update_username::update(ctx, username)
    }
}
