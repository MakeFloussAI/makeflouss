// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../interfaces/ILayerZeroEndpoint.sol";
import "../interfaces/ILayerZeroReceiver.sol";

abstract contract NonblockingLzApp is ILayerZeroReceiver {
    ILayerZeroEndpoint public immutable lzEndpoint;
    mapping(uint16 => bytes) public trustedRemoteLookup;

    event SetTrustedRemote(uint16 _srcChainId, bytes _srcAddress);
    event MessageFailed(uint16 _srcChainId, bytes _srcAddress, uint64 _nonce, bytes _payload);

    constructor(address _endpoint) {
        lzEndpoint = ILayerZeroEndpoint(_endpoint);
    }

    function lzReceive(uint16 _srcChainId, bytes calldata _srcAddress, uint64 _nonce, bytes calldata _payload) external override virtual {
        // lzReceive must be called by the endpoint for security
        require(msg.sender == address(lzEndpoint), "LzApp: invalid endpoint caller");

        _nonblockingLzReceive(_srcChainId, _srcAddress, _nonce, _payload);
    }

    function _nonblockingLzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) internal virtual;

    function _lzSend(uint16 _dstChainId, bytes memory _payload, address payable _refundAddress, address _zroPaymentAddress, bytes memory _adapterParams, uint _nativeFee) internal virtual {
        lzEndpoint.send{value: _nativeFee}(
            _dstChainId,
            trustedRemoteLookup[_dstChainId],
            _payload,
            _refundAddress,
            _zroPaymentAddress,
            _adapterParams
        );
    }

    function setTrustedRemote(uint16 _srcChainId, bytes calldata _srcAddress) external {
        trustedRemoteLookup[_srcChainId] = _srcAddress;
        emit SetTrustedRemote(_srcChainId, _srcAddress);
    }

    function isTrustedRemote(uint16 _srcChainId, bytes calldata _srcAddress) external view returns (bool) {
        return keccak256(trustedRemoteLookup[_srcChainId]) == keccak256(_srcAddress);
    }
} 