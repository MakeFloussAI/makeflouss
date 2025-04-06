// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../interfaces/ILayerZeroEndpoint.sol";
import "../interfaces/ILayerZeroReceiver.sol";

contract MockEndpoint is ILayerZeroEndpoint {
    mapping(address => uint16) public srcChainId;
    mapping(address => bytes) public srcAddress;
    mapping(address => uint64) public nonce;
    mapping(address => bytes) public payload;

    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable override {
        // Store the message details
        srcChainId[msg.sender] = _dstChainId;
        srcAddress[msg.sender] = _destination;
        payload[msg.sender] = _payload;
        nonce[msg.sender]++;
    }

    function receivePayload(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        address _dstAddress,
        uint64 _nonce,
        uint _gasLimit,
        bytes memory _payload
    ) external override {
        // Not implemented for mock
    }

    function getInboundNonce(uint16 _srcChainId, bytes calldata _srcAddress) external view override returns (uint64) {
        return 0;
    }

    function getOutboundNonce(uint16 _dstChainId, address _srcAddress) external view override returns (uint64) {
        return nonce[_srcAddress];
    }

    function estimateFees(
        uint16 _dstChainId,
        address _userApplication,
        bytes memory _payload,
        bool _payInZRO,
        bytes memory _adapterParam
    ) external view override returns (uint nativeFee, uint zroFee) {
        return (0.01 ether, 0); // Mock fee
    }

    function getConfig(
        uint16 _version,
        uint16 _chainId,
        address _userApplication,
        uint _configType
    ) external pure override returns (bytes memory) {
        return "";
    }

    function getSendVersion(address _userApplication) external pure override returns (uint16) {
        return 1;
    }

    function getReceiveVersion(address _userApplication) external pure override returns (uint16) {
        return 1;
    }

    function setConfig(
        uint16 _version,
        uint16 _chainId,
        uint _configType,
        bytes calldata _config
    ) external override {
        // Not implemented for mock
    }

    function setSendVersion(uint16 _version) external override {
        // Not implemented for mock
    }

    function setReceiveVersion(uint16 _version) external override {
        // Not implemented for mock
    }

    function forceResumeReceive(uint16 _srcChainId, bytes calldata _srcAddress) external override {
        // Not implemented for mock
    }

    // Helper function to simulate receiving a message
    function mockReceive(
        address _dstAddress,
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) external {
        ILayerZeroReceiver(_dstAddress).lzReceive(_srcChainId, _srcAddress, _nonce, _payload);
    }
} 