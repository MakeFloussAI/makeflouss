FROM node:18-slim

# Install dependencies
RUN apt-get update && apt-get install -y python3 build-essential git curl

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Add cargo to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Solana
RUN curl -sSfL https://release.solana.com/v1.17.7/install | sh

# Add Solana to PATH
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Set up working directory
WORKDIR /app

# Copy all project files first
COPY . .

# Install webpack locally in the frontend directory
RUN cd MFAI_MVP_Pitch_Test_API/frontend && npm install

# Install global tools
RUN npm install -g webpack webpack-cli webpack-dev-server

# Create .env file with environment variables
RUN echo "REACT_APP_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000" > MFAI_MVP_Pitch_Test_API/frontend/.env
RUN echo "REACT_APP_STAKING_ADDRESS=0x0000000000000000000000000000000000000000" >> MFAI_MVP_Pitch_Test_API/frontend/.env
RUN echo "REACT_APP_WALLET_CONNECT_PROJECT_ID=your_project_id" >> MFAI_MVP_Pitch_Test_API/frontend/.env

# Expose ports
EXPOSE 3000

RUN cd MFAI_MVP_Pitch_Test_API/frontend && npm install html-webpack-plugin --save-dev``

# Command to run the app - use npx to ensure webpack is found
CMD ["sh", "-c", "cd MFAI_MVP_Pitch_Test_API/frontend && npx webpack serve --mode development --host 0.0.0.0"]