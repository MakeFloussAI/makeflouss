use solana_program_test::*;
use solana_sdk::{
    account::Account,
    signature::Keypair,
    system_program,
    transaction::Transaction,
    pubkey::Pubkey,
};
use mfai_nft_program::{
    instruction::NFTInstruction,
    state::NFTMetadata,
};

#[tokio::test]
async fn test_create_nft() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "mfai_nft_program",
        program_id,
        processor!(mfai_nft_program::entrypoint::process_instruction),
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

#[tokio::test]
async fn test_update_nft_tier() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "mfai_nft_program",
        program_id,
        processor!(mfai_nft_program::entrypoint::process_instruction),
    );

    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

    // Create NFT first
    let nft_account = Keypair::new();
    let name = "Test NFT".to_string();
    let symbol = "TEST".to_string();
    let uri = "https://example.com/nft/1".to_string();

    let create_instruction = NFTInstruction::CreateNFT {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
    };

    let mut create_transaction = Transaction::new_with_payer(
        &[solana_program::instruction::Instruction::new_with_borsh(
            program_id,
            &create_instruction,
        )],
        Some(&payer.pubkey()),
    );

    create_transaction.sign(&[&payer, &nft_account], recent_blockhash);
    banks_client.process_transaction(create_transaction).await.unwrap();

    // Update NFT tier
    let new_tier = 2;
    let update_instruction = NFTInstruction::UpdateNFTTier {
        tier: new_tier,
    };

    let mut update_transaction = Transaction::new_with_payer(
        &[solana_program::instruction::Instruction::new_with_borsh(
            program_id,
            &update_instruction,
        )],
        Some(&payer.pubkey()),
    );

    update_transaction.sign(&[&payer, &nft_account], recent_blockhash);
    banks_client.process_transaction(update_transaction).await.unwrap();

    // Verify the tier was updated
    let account = banks_client
        .get_account(nft_account.pubkey())
        .await
        .unwrap()
        .unwrap();

    let metadata = NFTMetadata::try_from_slice(&account.data).unwrap();
    assert_eq!(metadata.tier, new_tier);
}

#[tokio::test]
async fn test_get_nft_info() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "mfai_nft_program",
        program_id,
        processor!(mfai_nft_program::entrypoint::process_instruction),
    );

    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

    // Create NFT first
    let nft_account = Keypair::new();
    let name = "Test NFT".to_string();
    let symbol = "TEST".to_string();
    let uri = "https://example.com/nft/1".to_string();

    let create_instruction = NFTInstruction::CreateNFT {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
    };

    let mut create_transaction = Transaction::new_with_payer(
        &[solana_program::instruction::Instruction::new_with_borsh(
            program_id,
            &create_instruction,
        )],
        Some(&payer.pubkey()),
    );

    create_transaction.sign(&[&payer, &nft_account], recent_blockhash);
    banks_client.process_transaction(create_transaction).await.unwrap();

    // Get NFT info
    let get_info_instruction = NFTInstruction::GetNFTInfo;

    let mut get_info_transaction = Transaction::new_with_payer(
        &[solana_program::instruction::Instruction::new_with_borsh(
            program_id,
            &get_info_instruction,
        )],
        Some(&payer.pubkey()),
    );

    get_info_transaction.sign(&[&payer, &nft_account], recent_blockhash);
    banks_client.process_transaction(get_info_transaction).await.unwrap();

    // Verify the NFT info
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

#[tokio::test]
async fn test_unauthorized_update() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "mfai_nft_program",
        program_id,
        processor!(mfai_nft_program::entrypoint::process_instruction),
    );

    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

    // Create NFT first
    let nft_account = Keypair::new();
    let name = "Test NFT".to_string();
    let symbol = "TEST".to_string();
    let uri = "https://example.com/nft/1".to_string();

    let create_instruction = NFTInstruction::CreateNFT {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
    };

    let mut create_transaction = Transaction::new_with_payer(
        &[solana_program::instruction::Instruction::new_with_borsh(
            program_id,
            &create_instruction,
        )],
        Some(&payer.pubkey()),
    );

    create_transaction.sign(&[&payer, &nft_account], recent_blockhash);
    banks_client.process_transaction(create_transaction).await.unwrap();

    // Try to update NFT tier with unauthorized account
    let unauthorized_user = Keypair::new();
    let new_tier = 2;
    let update_instruction = NFTInstruction::UpdateNFTTier {
        tier: new_tier,
    };

    let mut update_transaction = Transaction::new_with_payer(
        &[solana_program::instruction::Instruction::new_with_borsh(
            program_id,
            &update_instruction,
        )],
        Some(&unauthorized_user.pubkey()),
    );

    update_transaction.sign(&[&unauthorized_user, &nft_account], recent_blockhash);
    
    // This should fail
    let result = banks_client.process_transaction(update_transaction).await;
    assert!(result.is_err());
} 