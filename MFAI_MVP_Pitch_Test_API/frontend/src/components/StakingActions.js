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

const Info = styled.div`
  margin-bottom: 20px;
  font-size: 1.1em;
`;

function StakingActions() {
  const [amount, setAmount] = useState('');
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const stakingAddress = process.env.REACT_APP_STAKING_ADDRESS;

  // Read staked balance
  const { data: stakedBalance } = useReadContract({
    address: stakingAddress,
    abi: [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'stakedBalance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'stakedBalance',
    args: [address],
  });

  // Prepare stake transaction
  const { data: stakeData } = useSimulateContract({
    address: stakingAddress,
    abi: [
      {
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'stake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'stake',
    args: [parseEther(amount || '0')],
  });

  // Write stake transaction
  const { writeContract: stake } = useWriteContract();

  // Handle stake
  const handleStake = async () => {
    if (!stakeData) return;
    try {
      await stake(stakeData.request);
      setAmount('');
    } catch (error) {
      console.error('Error staking tokens:', error);
    }
  };

  // Prepare unstake transaction
  const { data: unstakeData } = useSimulateContract({
    address: stakingAddress,
    abi: [
      {
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'unstake',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'unstake',
    args: [parseEther(amount || '0')],
  });

  // Write unstake transaction
  const { writeContract: unstake } = useWriteContract();

  // Handle unstake
  const handleUnstake = async () => {
    if (!unstakeData) return;
    try {
      await unstake(unstakeData.request);
      setAmount('');
    } catch (error) {
      console.error('Error unstaking tokens:', error);
    }
  };

  return (
    <Container>
      <Title>Staking Actions</Title>
      <Info>
        Staked Balance: {stakedBalance ? formatEther(stakedBalance) : '0'} MFAI
      </Info>
      <Input
        type="number"
        placeholder="Amount to stake/unstake"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button onClick={handleStake} disabled={!amount || !stakeData}>
        Stake Tokens
      </Button>
      <Button onClick={handleUnstake} disabled={!amount || !unstakeData}>
        Unstake Tokens
      </Button>
    </Container>
  );
}

export default StakingActions; 