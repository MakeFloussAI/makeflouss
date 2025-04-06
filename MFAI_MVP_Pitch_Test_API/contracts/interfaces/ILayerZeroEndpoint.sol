// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ILayerZeroEndpoint {
    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;

    function receivePayload(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        address _dstAddress,
        uint64 _nonce,
        uint _gasLimit,
        bytes memory _payload
    ) external;

    function getInboundNonce(uint16 _srcChainId, bytes calldata _srcAddress) external view returns (uint64);

    function getOutboundNonce(uint16 _dstChainId, address _srcAddress) external view returns (uint64);

    function estimateFees(
        uint16 _dstChainId,
        address _userApplication,
        bytes memory _payload,
        bool _payInZRO,
        bytes memory _adapterParam
    ) external view returns (uint nativeFee, uint zroFee);

    function getConfig(
        uint16 _version,
        uint16 _chainId,
        address _userApplication,
        uint _configType
    ) external view returns (bytes memory);

    function getSendVersion(address _userApplication) external view returns (uint16);

    function getReceiveVersion(address _userApplication) external view returns (uint16);

    function setConfig(
        uint16 _version,
        uint16 _chainId,
        uint _configType,
        bytes calldata _config
    ) external;

    function setSendVersion(uint16 _version) external;

    function setReceiveVersion(uint16 _version) external;

    function forceResumeReceive(uint16 _srcChainId, bytes calldata _srcAddress) external;
} 