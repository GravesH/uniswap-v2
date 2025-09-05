import React from "react";
import TokenSelector from "./TokenSelector";

const SwapForm: React.FC = () => {
  return (
    <div
      style={{
        marginBottom: 32,
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h3>币币兑换</h3>
      <TokenSelector label="兑换币种A" />
      <TokenSelector label="兑换币种B" />
      <div style={{ marginTop: 16 }}>
        <input
          type="number"
          placeholder="输入兑换数量"
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      <button style={{ marginTop: 16, width: "100%" }}>兑换</button>
    </div>
  );
};

export default SwapForm;
