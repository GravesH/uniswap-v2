import type { HardhatUserConfig } from "hardhat/config";
//负责将 Mocha（测试运行器）和 Ethers.js（区块链交互库）无缝集成到 Hardhat 环境中。
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
//内部工具函数，用于安全、类型安全地读取 Hardhat 配置中的变量。
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      {
        version: "0.4.18",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
    // profiles: {
    //   default: {
    //     version: "0.8.28",
    //   },
    //   production: {
    //     version: "0.8.28",
    //     settings: {
    //       optimizer: {
    //         enabled: true,
    //         runs: 200,
    //       },
    //     },
    //   },
    //   legacy: {
    //     version: "0.5.16",
    //     settings: {
    //       optimizer: { enabled: true, runs: 200 },
    //     },
    //   },
    // },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      //指定 Hardhat 连接到哪个 以太坊节点（RPC endpoint）
      //也就是 Hardhat 部署合约、调用链上方法时要“发送交易”的目标节点
      url: configVariable("SEPOLIA_RPC_URL"),
      //指定 Hardhat 使用哪个账户来部署合约、发送交易 钱包的私钥!!!!
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
  verify: {
    etherscan: {
      // ✅ 在 etherscan.io 注册后获取   API KEY
      apiKey: configVariable("ETHERSCAN_API_KEY"), // 这里用 configVariable
    },
  },
};

export default config;
