import React, { useState } from "react";

// 新增 ERC20 代币生成入口组件，支持手动输入名称和数量
const CreateTokenEntry: React.FC = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");

  return (
    <div
      style={{
        marginBottom: 32,
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h3>测试网生成 ERC20 代币</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          placeholder="代币名称"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="代币符号"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="number"
          placeholder="初始发行数量"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
      </div>
      <button style={{ width: "100%" }}>生成 ERC20 代币</button>
    </div>
  );
};
export default CreateTokenEntry;
