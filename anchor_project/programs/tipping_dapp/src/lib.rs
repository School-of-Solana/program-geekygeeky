use anchor_lang::prelude::*;

pub mod state;
pub mod errors;
pub mod instructions;

use instructions::*;
declare_id!("2vWCcBBsaLgEituJTJnvADGGQamSMqGakos2fPAfdrYk");


#[program]
pub mod anchor_project {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatform>) -> Result<()> {
        instructions::initialize_platform::handler(ctx)
    }
}
