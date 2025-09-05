import React from "react";

interface TokenSelectorProps {
  label: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ label }) => {
  return (
    <div style={{ marginBottom: 8 }}>
      <label>{label}</label>
      <select style={{ width: "100%", padding: 8 }}>
        <option value="ETH">ETH</option>
        <option value="USDT">USDT</option>
        <option value="DAI">DAI</option>
        {/* 可根据实际币种扩展 */}
      </select>
    </div>
  );
};

export default TokenSelector;
