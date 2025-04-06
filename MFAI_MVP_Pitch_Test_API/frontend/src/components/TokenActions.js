import React, { useState } from 'react';
import styled from 'styled-components';
import { useAccount, usePublicClient, useWalletClient, useReadContract, useWriteContract, useSimulateContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Balance = styled.div`
  margin-bottom: 20px;
  font-size: 1.1em;
`;

function TokenActions() {
  const [amount, setAmount] = useState('');
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Contract addresses from environment variables
  const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
  const stakingAddress = process.env.REACT_APP_STAKING_ADDRESS;

  // Read token balance
  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [address],
  });

  // Prepare approve transaction
  const { data: approveData } = useSimulateContract({
    address: tokenAddress,
    abi: [
      {
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'approve',
    args: [stakingAddress, parseEther(amount || '0')],
  });

  // Write approve transaction
  const { writeContract: approve } = useWriteContract();

  // Handle approve
  const handleApprove = async () => {
    if (!approveData) return;
    try {
      await approve(approveData.request);
    } catch (error) {
      console.error('Error approving tokens:', error);
    }
  };

  return (
    <Container>
      <Title>Token Actions</Title>
      <Balance>
        Balance: {balance ? formatEther(balance) : '0'} MFAI
      </Balance>
      <Input
        type="number"
        placeholder="Amount to approve"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button onClick={handleApprove} disabled={!amount || !approveData}>
        Approve Tokens
      </Button>
    </Container>
  );
}

export default TokenActions; 