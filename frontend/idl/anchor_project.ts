/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/anchor_project.json`.
 */
export type AnchorProject = {
  "address": "2vWCcBBsaLgEituJTJnvADGGQamSMqGakos2fPAfdrYk",
  "metadata": {
    "name": "anchorProject",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor by Olushola O."
  },
  "instructions": [
    {
      "name": "createProfile",
      "discriminator": [
        225,
        205,
        234,
        143,
        17,
        186,
        50,
        220
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "profile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "stats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "splMint",
          "docs": [
            "The SPL token mint this profile tracks (USDC, BONK, etc.)"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializePlatform",
      "discriminator": [
        119,
        201,
        101,
        45,
        75,
        122,
        89,
        3
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "sendSolTip",
      "discriminator": [
        87,
        59,
        189,
        185,
        62,
        123,
        158,
        126
      ],
      "accounts": [
        {
          "name": "tipper",
          "writable": true,
          "signer": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "recipientStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "recipient"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "sendSplTip",
      "discriminator": [
        96,
        134,
        207,
        1,
        31,
        152,
        61,
        215
      ],
      "accounts": [
        {
          "name": "tipper",
          "writable": true,
          "signer": true
        },
        {
          "name": "tipperAta",
          "docs": [
            "Tipper token account"
          ],
          "writable": true
        },
        {
          "name": "recipientAta",
          "docs": [
            "Recipient token account"
          ],
          "writable": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "tokenMint",
          "docs": [
            "SPL token mint used for tipping"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "recipientStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "recipient"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateUsername",
      "discriminator": [
        233,
        103,
        45,
        8,
        250,
        100,
        216,
        251
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "profile"
          ]
        },
        {
          "name": "profile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "discriminator": [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      "name": "tipStats",
      "discriminator": [
        239,
        98,
        209,
        113,
        95,
        177,
        181,
        40
      ]
    },
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "usernameTooLong",
      "msg": "Username too long"
    },
    {
      "code": 6001,
      "name": "messageTooLong",
      "msg": "Message too long"
    },
    {
      "code": 6002,
      "name": "profileExists",
      "msg": "Profile already exists"
    },
    {
      "code": 6003,
      "name": "profileNotExists",
      "msg": "Recipient does not exist"
    },
    {
      "code": 6004,
      "name": "tipStatsExists",
      "msg": "Tip stats already exist"
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Unauthorized action"
    },
    {
      "code": 6006,
      "name": "invalidMint",
      "msg": "Invalid SPL token mint"
    },
    {
      "code": 6007,
      "name": "insufficientLamports",
      "msg": "Insufficient lamports"
    }
  ],
  "types": [
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "totalSolTipped",
            "type": "u64"
          },
          {
            "name": "totalSplTipped",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tipStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "totalSolReceived",
            "type": "u64"
          },
          {
            "name": "totalSplReceived",
            "type": "u64"
          },
          {
            "name": "splMint",
            "type": "pubkey"
          },
          {
            "name": "lastMessage",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
