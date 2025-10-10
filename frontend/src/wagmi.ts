import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism, polygon, sepolia } from "wagmi/chains";
import { http, webSocket } from "wagmi";
import { request, gql } from "graphql-request";
import { localhost } from "./chain"; //本地部署的区块链网络配置
//核心作用就是告诉你的前端应用应该去连接哪些区块链网络、
// 如何使用这些网络，以及如何与用户的钱包进行安全交互！！！！
export const config = getDefaultConfig({
  appName: "RainbowKit App",
  //作用：连接钱包
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  // chains: [mainnet, polygon, optimism, arbitrum, base, ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []), localhost],
  chains: [localhost, ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : [])],
  transports: {
    // [mainnet.id]: http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`),
    // [polygon.id]: http(`https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`),
    // [optimism.id]: http(`https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`),
    // [arbitrum.id]: http(`https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`),
    // [base.id]: http(`https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`),
    // 🚀 重点：强制指定 Sepolia 的 Infura 节点
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY2}`),
    [localhost.id]: http("http://127.0.0.1:8545"), // 本地区块链节点！！
  },
  ssr: true,
});
