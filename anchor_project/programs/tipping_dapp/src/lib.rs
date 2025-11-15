use anchor_lang::prelude::*;

declare_id!("8tLF26375xiEFZkyDFSkvkfFeEYmeADwCHDh7up6Uubj");

#[program]
pub mod anchor_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
