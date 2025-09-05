import React, { useState } from "react";
import SwapForm from "../components/SwapForm";
import LiquidityPool from "../components/LiquidityPool";
import PoolStats from "../components/PoolStats";
import CreateTokenEntry from "../components/CreateTokenEntry";

const ExchangePage: React.FC = () => {
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
