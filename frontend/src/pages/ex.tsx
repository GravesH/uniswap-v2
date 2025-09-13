import React, { useEffect, useState } from "react";
import SwapForm from "../components/SwapForm";
import LiquidityPool from "../components/LiquidityPool";
import PoolStats from "../components/PoolStats";
import CreateTokenEntry from "../components/CreateTokenEntry";
import { useTokenStore } from "../store/tokenStore";
import { usePublicClient, useAccount } from "wagmi";

const ExchangePage: React.FC = () => {
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();
  const reloadFromFactory = useTokenStore((s) => s.reloadFromFactory);

  useEffect(() => {
    // 只有在客户端连接且网络准备好时才加载代币
    if (publicClient && isConnected) {
      console.log("网络和钱包已连接，开始加载代币列表");
      reloadFromFactory(publicClient);
    } else {
      console.log("等待网络或钱包连接...", { publicClient: !!publicClient, isConnected });
    }
  }, [publicClient, isConnected, reloadFromFactory]);
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h2>Uniswap V2 兑币平台</h2>
      <CreateTokenEntry />
      <SwapForm />
      <PoolStats />
      <LiquidityPool />
    </div>
  );
};

export default ExchangePage;
