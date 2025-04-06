use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum NFTInstruction {
    CreateNFT {
        name: String,
        symbol: String,
        uri: String,
    },
    UpdateNFTTier {
        tier: u8,
    },
    GetNFTInfo,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NFTMetadata {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub tier: u8,
    pub owner: Pubkey,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = NFTInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        NFTInstruction::CreateNFT { name, symbol, uri } => {
            msg!("Instruction: CreateNFT");
            process_create_nft(program_id, accounts, name, symbol, uri)
        }
        NFTInstruction::UpdateNFTTier { tier } => {
            msg!("Instruction: UpdateNFTTier");
            process_update_nft_tier(accounts, tier)
        }
        NFTInstruction::GetNFTInfo => {
            msg!("Instruction: GetNFTInfo");
            process_get_nft_info(accounts)
        }
    }
}

fn process_create_nft(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    symbol: String,
    uri: String,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let nft_account = next_account_info(account_info_iter)?;
    let owner = next_account_info(account_info_iter)?;

    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let metadata = NFTMetadata {
        name,
        symbol,
        uri,
        tier: 1,
        owner: *owner.key,
    };

    metadata.serialize(&mut *nft_account.data.borrow_mut())?;
    Ok(())
}

fn process_update_nft_tier(accounts: &[AccountInfo], tier: u8) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let nft_account = next_account_info(account_info_iter)?;
    let owner = next_account_info(account_info_iter)?;

    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let mut metadata = NFTMetadata::try_from_slice(&nft_account.data.borrow())?;
    if metadata.owner != *owner.key {
        return Err(ProgramError::IllegalOwner);
    }

    metadata.tier = tier;
    metadata.serialize(&mut *nft_account.data.borrow_mut())?;
    Ok(())
}

fn process_get_nft_info(accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let nft_account = next_account_info(account_info_iter)?;

    let metadata = NFTMetadata::try_from_slice(&nft_account.data.borrow())?;
    msg!("NFT Info: {:?}", metadata);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use solana_program::clock::Epoch;
    use solana_program_test::*;
    use solana_sdk::{
        signature::Keypair,
        transaction::Transaction,
        system_program,
    };

    #[tokio::test]
    async fn test_create_nft() {
        let program_id = Pubkey::new_unique();
        let mut program_test = ProgramTest::new(
            "mfai_nft_program",
            program_id,
            processor!(process_instruction),
        );

        let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

        let nft_account = Keypair::new();
        let name = "Test NFT".to_string();
        let symbol = "TEST".to_string();
        let uri = "https://example.com/nft/1".to_string();

        let instruction = NFTInstruction::CreateNFT {
            name: name.clone(),
            symbol: symbol.clone(),
            uri: uri.clone(),
        };

        let mut transaction = Transaction::new_with_payer(
            &[solana_program::instruction::Instruction::new_with_borsh(
                program_id,
                &instruction,
            )],
            Some(&payer.pubkey()),
        );

        transaction.sign(&[&payer, &nft_account], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();

        let account = banks_client
            .get_account(nft_account.pubkey())
            .await
            .unwrap()
            .unwrap();

        let metadata = NFTMetadata::try_from_slice(&account.data).unwrap();
        assert_eq!(metadata.name, name);
        assert_eq!(metadata.symbol, symbol);
        assert_eq!(metadata.uri, uri);
        assert_eq!(metadata.tier, 1);
        assert_eq!(metadata.owner, payer.pubkey());
    }
} 