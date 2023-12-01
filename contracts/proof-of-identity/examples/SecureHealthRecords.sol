// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IProofOfIdentity.sol";

/**
 * @title SecureHealthRecords
 * @dev A contract for securely managing healthcare records with Proof of Identity.
 */
contract SecureHealthRecords is AccessControl {
    // State variables
    IProofOfIdentity private _proofOfIdentity;
    mapping(uint256 => HealthRecord) private _healthRecords; // patientTokenId => HealthRecord
    mapping(uint256 => mapping(address => bool)) private _accessControl; // patientTokenId => grantee => bool

    // Health record structure
    struct HealthRecord {
        string data;
        bool isSet;
    }

    // Events
    event HealthRecordAdded(uint256 indexed patientTokenId, string record);
    event AccessGranted(uint256 indexed patientTokenId, address indexed grantee);
    event AccessRevoked(uint256 indexed patientTokenId, address indexed grantee);

    // Errors
    error Unauthorized();
    error NoHealthRecord();
    error AlreadyGranted();
    error AlreadyRevoked();

    // Modifiers
    modifier onlyAuthorized(uint256 patientTokenId) {
        if (!isAuthorized(msg.sender, patientTokenId)) {
            revert Unauthorized();
        }
        _;
    }

    modifier hasHealthRecord(uint256 patientTokenId) {
        if (!_healthRecords[patientTokenId].isSet) {
            revert NoHealthRecord();
        }
        _;
    }

    // Constructor
    constructor(address admin, address proofOfIdentityAddress) {
        _proofOfIdentity = IProofOfIdentity(proofOfIdentityAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // Functions
    function addHealthRecord(uint256 patientTokenId, string memory record) external onlyAuthorized(patientTokenId) {
        _healthRecords[patientTokenId] = HealthRecord(record, true);
        emit HealthRecordAdded(patientTokenId, record);
    }

    function getHealthRecord(uint256 patientTokenId) external view onlyAuthorized(patientTokenId) hasHealthRecord(patientTokenId) returns (string memory) {
        return _healthRecords[patientTokenId].data;
    }

    function grantAccess(uint256 patientTokenId, address grantee) external {
        require(_proofOfIdentity.tokenID(msg.sender) == patientTokenId, "Only patient can grant access");
        if (_accessControl[patientTokenId][grantee]) {
            revert AlreadyGranted();
        }
        _accessControl[patientTokenId][grantee] = true;
        emit AccessGranted(patientTokenId, grantee);
    }

    function revokeAccess(uint256 patientTokenId, address grantee) external {
        require(_proofOfIdentity.tokenID(msg.sender) == patientTokenId, "Only patient can revoke access");
        if (!_accessControl[patientTokenId][grantee]) {
            revert AlreadyRevoked();
        }
        _accessControl[patientTokenId][grantee] = false;
        emit AccessRevoked(patientTokenId, grantee);
    }

    function isAuthorized(address user, uint256 patientTokenId) public view returns (bool) {
        return _accessControl[patientTokenId][user] || _proofOfIdentity.tokenID(user) == patientTokenId;
    }

    function poiAddress() external view returns (address) {
        return address(_proofOfIdentity);
    }
}
