import React from "react";

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

const TokenSelector: React.FC<TokenSelectorProps> = ({
  label,
  tokens,
  selectedToken,
  onSelect
}) => {
  return (
    <div style={{ marginBottom: 8 }}>
      <label>{label}</label>
      <select 
        value={selectedToken?.address || ''}
        onChange={(e) => {
          const token = tokens.find(t => t.address === e.target.value);
          token && onSelect(token);
        }}
        style={{ width: "100%", padding: 8 }}
      >
        <option value="">选择代币</option>
        {tokens.map((token) => (
          <option key={token.address} value={token.address}>
            {token.symbol}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TokenSelector;
