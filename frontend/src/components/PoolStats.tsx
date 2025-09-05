import React from "react";

const PoolStats: React.FC = () => {
  return (
    <div
      style={{
        marginBottom: 32,
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h3>资金池信息</h3>
      <div>池子总量: 1000 ETH / 2000 USDT</div>
      <div>当前价格: 1 ETH = 2000 USDT</div>
      {/* 可扩展更多统计信息 */}
    </div>
  );
};

export default PoolStats;
