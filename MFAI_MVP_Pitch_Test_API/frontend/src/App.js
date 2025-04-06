import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import TokenActions from './components/TokenActions';
import StakingActions from './components/StakingActions';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

function App() {
  const { isConnected } = useAccount();

  return (
    <AppContainer>
      <Header>
        <Title>MFAI Bridge</Title>
        <ConnectButton />
      </Header>
      
      {isConnected ? (
        <MainContent>
          <Card>
            <TokenActions />
          </Card>
          <Card>
            <StakingActions />
          </Card>
        </MainContent>
      ) : (
        <Card>
          <h2>Connectez votre wallet pour commencer</h2>
        </Card>
      )}
    </AppContainer>
  );
}

export default App; 