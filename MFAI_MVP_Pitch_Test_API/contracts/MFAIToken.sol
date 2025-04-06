// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./lzApp/NonblockingLzApp.sol";

contract MFAIToken is ERC20, Ownable, NonblockingLzApp {
    bool private _isLocalTransfer;

    constructor(address _endpoint) ERC20("MFAI Token", "MFAI") NonblockingLzApp(_endpoint) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function _nonblockingLzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) internal override {
        require(_srcAddress.length == 20, "Invalid source address");
        require(trustedRemoteLookup[_srcChainId].length > 0, "Source chain not trusted");
        require(keccak256(_srcAddress) == keccak256(trustedRemoteLookup[_srcChainId]), "Source address not trusted");

        // Decode the payload
        (address to, uint256 amount) = abi.decode(_payload, (address, uint256));
        
        // Mint tokens to the recipient
        _mint(to, amount);
    }

    function send(uint16 _dstChainId, bytes memory _destination, uint256 _amount) public payable {
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(trustedRemoteLookup[_dstChainId].length > 0, "Destination chain not trusted");
        
        // Burn tokens from sender
        _burn(msg.sender, _amount);
        
        // Encode the payload
        bytes memory payload = abi.encode(msg.sender, _amount);
        
        // Send the message
        _lzSend(_dstChainId, payload, payable(msg.sender), address(0x0), bytes(""), msg.value);
    }

    function estimateFee(uint16 _dstChainId, bytes memory _destination, uint256 _amount) public view returns (uint256 nativeFee, uint256 zroFee) {
        bytes memory payload = abi.encode(msg.sender, _amount);
        return lzEndpoint.estimateFees(_dstChainId, address(this), payload, false, bytes(""));
    }

    // Override the _transfer function to handle local transfers
    function _transfer(address from, address to, uint256 amount) internal virtual override {
        _isLocalTransfer = true;
        super._transfer(from, to, amount);
        _isLocalTransfer = false;
    }

    // Override the lzReceive function to only handle cross-chain messages
    function lzReceive(uint16 _srcChainId, bytes calldata _srcAddress, uint64 _nonce, bytes calldata _payload) external override {
        require(!_isLocalTransfer, "Local transfer");
        require(msg.sender == address(lzEndpoint), "LzApp: invalid endpoint caller");
        _nonblockingLzReceive(_srcChainId, _srcAddress, _nonce, _payload);
    }
} 