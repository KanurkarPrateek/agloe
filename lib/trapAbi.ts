// ABI for TrapRegistry — generated from lib/contracts.json (contracts/TrapRegistry.sol)
export const TRAP_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "commitment",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "stationId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "modelId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "suspectModel",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "hitRate",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "evidenceHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "LeakProven",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "commitment",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "stationId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "planter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "plantCount",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "TrapCommitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "commitment",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "stationUrl",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "trigger",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "answer",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "committedAt",
        "type": "uint64"
      }
    ],
    "name": "TrapRevealed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "commitment",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "stationId",
        "type": "bytes32"
      },
      {
        "internalType": "uint32",
        "name": "plantCount",
        "type": "uint32"
      }
    ],
    "name": "commitTrap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "stationUrl",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "suspectModel",
        "type": "string"
      }
    ],
    "name": "getLink",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "stationUrl",
        "type": "string"
      }
    ],
    "name": "getStation",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "trapsPlanted",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "leaksProven",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "lastLeakAt",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "commitment",
        "type": "bytes32"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "trigger",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "answer",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "salt",
            "type": "bytes32"
          }
        ],
        "internalType": "struct TrapRegistry.Reveal",
        "name": "r",
        "type": "tuple"
      },
      {
        "internalType": "string",
        "name": "stationUrl",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "suspectModel",
        "type": "string"
      },
      {
        "internalType": "uint16",
        "name": "hitRate",
        "type": "uint16"
      },
      {
        "internalType": "bytes32",
        "name": "evidenceHash",
        "type": "bytes32"
      }
    ],
    "name": "proveLeak",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "traps",
    "outputs": [
      {
        "internalType": "address",
        "name": "planter",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "stationId",
        "type": "bytes32"
      },
      {
        "internalType": "uint64",
        "name": "committedAt",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "plantCount",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "revealed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
