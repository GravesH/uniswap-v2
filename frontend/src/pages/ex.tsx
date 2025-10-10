import React, { useEffect, useState } from "react";
import SwapForm from "../components/SwapForm";
import LiquidityPool from "../components/LiquidityPool";
import PoolStats from "../components/PoolStats";
import CreateTokenEntry from "../components/CreateTokenEntry";
import { useTokenStore } from "../store/tokenStore";
import { usePublicClient, useAccount } from "wagmi";

const tabs = [
  { id: "create", label: "创建代币" },
  { id: "swap", label: "兑换" },
  { id: "pool", label: "流动性管理" },
  { id: "stats", label: "流动性统计" },
];

const ExchangePage: React.FC = () => {
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();
  const reloadFromFactory = useTokenStore((s) => s.reloadFromFactory);
  const [activeTab, setActiveTab] = useState("create");

  useEffect(() => {
    if (publicClient && isConnected) {
      console.log("网络和钱包已连接，开始加载代币列表");
      reloadFromFactory(publicClient);
    } else {
      console.log("等待网络或钱包连接...", { publicClient: !!publicClient, isConnected });
    }
  }, [publicClient, isConnected, reloadFromFactory]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-tech-grid">
      <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_-10%_-10%,rgba(139,92,246,0.10),transparent),radial-gradient(800px_500px_at_110%_110%,rgba(34,211,238,0.08),transparent)] animate-pulse-soft pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        <div className="glass-card shadow-neon p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-6 tracking-wide">Uniswap V2 兑币平台</h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 bg-[rgba(255,255,255,0.7)] p-2 rounded-xl border border-[rgba(148,163,184,0.25)] mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-sm font-semibold transition-all
                  ${
                    activeTab === tab.id
                      ? "tab-active"
                      : "tab-inactive hover:border-[rgba(139,92,246,0.35)] hover:bg-[rgba(255,255,255,0.85)]"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid gap-6">
            {activeTab === "create" && (
              <div className="glass-card p-4 md:p-6">
                <CreateTokenEntry />
              </div>
            )}
            {activeTab === "swap" && (
              <div className="glass-card p-4 md:p-6">
                <SwapForm />
              </div>
            )}
            {activeTab === "stats" && (
              <div className="glass-card p-4 md:p-6">
                <PoolStats />
              </div>
            )}
            {activeTab === "pool" && (
              <div className="glass-card p-4 md:p-6">
                <LiquidityPool />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;
