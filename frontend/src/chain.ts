import { Chain } from "@rainbow-me/rainbowkit";

// 定义本地开发网络
export const localhost: Chain = {
  id: 31337, // Hardhat 网络的默认链ID
  name: "Localhost",
  network: "localhost",
  iconUrl: "https://i.imgur.com/6KneIuP.png", // 可选，可以找个本地图标
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"], // Hardhat 节点的默认RPC地址
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  testnet: true, // 明确标记为测试网
};
