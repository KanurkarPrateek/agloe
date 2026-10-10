// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ProofOfModel — TrapRegistry ("trap streets" for LLM traffic)
/// @notice Cartographers drew fake streets into maps to prove copying. We do
///         the same for prompts: a planter invents a unique fake fact, commits
///         its hash here, then sends it through one suspected transit station.
///         If a model released later reproduces the fact, the oracle reveals
///         the commitment — a timestamped, public, reproducible link between
///         that station and the model trained on its harvested traffic.
contract TrapRegistry {
    struct Trap {
        address planter;
        bytes32 stationId;     // keccak256(stationUrl)
        uint64  committedAt;
        uint32  plantCount;    // how many times the trap was sent through the station
        bool    revealed;
    }

    /// @dev The secret behind a commitment.
    struct Reveal {
        string  trigger;   // the fictional entity the trap is about
        string  answer;    // the high-entropy fake fact only a leak could teach
        bytes32 salt;
    }

    struct Station {
        uint64 trapsPlanted;
        uint64 leaksProven;
        uint64 lastLeakAt;
    }

    address public owner;
    mapping(address => bool) public verifiers;            // oracle nodes that run the probes
    mapping(bytes32 => Trap) public traps;                // id = commitment
    mapping(bytes32 => Station) public stations;          // id = keccak256(stationUrl)
    mapping(bytes32 => mapping(bytes32 => uint64)) public leakLinks; // station → model → leaks

    event TrapCommitted(
        bytes32 indexed commitment,
        bytes32 indexed stationId,
        address indexed planter,
        uint32  plantCount,
        uint256 timestamp
    );
    /// @dev The reveal: the secret is public from here on, so anyone can re-probe.
    event TrapRevealed(
        bytes32 indexed commitment,
        string  stationUrl,
        string  trigger,
        string  answer,
        uint64  committedAt
    );
    event LeakProven(
        bytes32 indexed commitment,
        bytes32 indexed stationId,
        bytes32 indexed modelId,
        string  suspectModel,
        uint16  hitRate,       // 0-100: share of probes that reproduced the secret
        bytes32 evidenceHash,  // keccak256 of the suspect model's raw responses
        uint256 timestamp
    );
    event VerifierAdded(address indexed verifier);

    constructor() {
        owner = msg.sender;
        verifiers[msg.sender] = true;
        emit VerifierAdded(msg.sender);
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "not a verifier");
        _;
    }

    function addVerifier(address v) external {
        require(msg.sender == owner, "only owner");
        verifiers[v] = true;
        emit VerifierAdded(v);
    }

    /// @notice Commit a trap before planting it. Anyone can plant.
    /// @param commitment keccak256(abi.encode(r.trigger, r.answer, r.salt))
    function commitTrap(bytes32 commitment, bytes32 stationId, uint32 plantCount) external {
        require(traps[commitment].committedAt == 0, "trap exists");
        traps[commitment] = Trap({
            planter: msg.sender,
            stationId: stationId,
            committedAt: uint64(block.timestamp),
            plantCount: plantCount,
            revealed: false
        });
        stations[stationId].trapsPlanted += 1;
        emit TrapCommitted(commitment, stationId, msg.sender, plantCount, block.timestamp);
    }

    /// @notice Reveal a trap that a suspect model reproduced. Only oracle nodes
    ///         that actually ran the probes may call this; once revealed, the
    ///         trigger + answer are public so anyone can re-run the probe.
    function proveLeak(
        bytes32 commitment,
        Reveal calldata r,
        string calldata stationUrl,
        string calldata suspectModel,
        uint16 hitRate,
        bytes32 evidenceHash
    ) external onlyVerifier {
        Trap storage t = traps[commitment];
        require(t.committedAt != 0, "unknown trap");
        require(!t.revealed, "already revealed");
        require(hitRate <= 100, "hitRate > 100");
        require(keccak256(abi.encode(r.trigger, r.answer, r.salt)) == commitment, "bad reveal");
        require(keccak256(bytes(stationUrl)) == t.stationId, "wrong station");

        t.revealed = true;
        bytes32 modelId = keccak256(bytes(suspectModel));
        Station storage s = stations[t.stationId];
        s.leaksProven += 1;
        s.lastLeakAt = uint64(block.timestamp);
        leakLinks[t.stationId][modelId] += 1;

        emit TrapRevealed(commitment, stationUrl, r.trigger, r.answer, t.committedAt);
        emit LeakProven(
            commitment, t.stationId, modelId, suspectModel, hitRate, evidenceHash, block.timestamp
        );
    }

    function getStation(string calldata stationUrl)
        external
        view
        returns (uint64 trapsPlanted, uint64 leaksProven, uint64 lastLeakAt)
    {
        Station memory s = stations[keccak256(bytes(stationUrl))];
        return (s.trapsPlanted, s.leaksProven, s.lastLeakAt);
    }

    function getLink(string calldata stationUrl, string calldata suspectModel)
        external
        view
        returns (uint64)
    {
        return leakLinks[keccak256(bytes(stationUrl))][keccak256(bytes(suspectModel))];
    }
}
