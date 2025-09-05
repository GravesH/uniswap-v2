import React from "react";

const LiquidityPool: React.FC = () => {
  return (
    <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
      <h3>资金池操作</h3>
      <div>
        <input
          type="number"
          placeholder="添加流动性数量"
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <button style={{ width: "100%" }}>添加流动性</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <input
          type="number"
          placeholder="移除流动性数量"
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <button style={{ width: "100%" }}>移除流动性</button>
      </div>
    </div>
  );
};

export default LiquidityPool;
