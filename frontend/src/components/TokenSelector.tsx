import React from "react";
import { Select } from "antd";

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface TokenSelectorProps {
  label: string;
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ label, tokens, selectedToken, onSelect }) => {
  return (
    <div style={{ marginBottom: 8 }}>
      <label>{label}</label>
      <Select
        value={selectedToken?.address || ""}
        onChange={(value) => {
          const token = tokens.find((t) => t.address === value);
          token && onSelect(token);
        }}
        style={{ width: "100%" }}
      >
        <Select.Option value="">选择代币</Select.Option>
        {tokens.map((token) => (
          <Select.Option key={token.address} value={token.address}>
            {token.symbol}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default TokenSelector;
