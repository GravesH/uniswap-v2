import React, { useState } from "react";

// 模拟的代币类型
interface Token {
  address: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
}

// 模拟的代币列表
const mockTokens: Token[] = [
  {
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    name: "Uniswap",
    symbol: "UNI",
    balance: "100.0",
    decimals: 18,
  },
  {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    name: "Dai Stablecoin",
    symbol: "DAI",
    balance: "500.0",
    decimals: 18,
  },
  {
    address: "0xYourMintedTokenAddress1",
    name: "My Token 1",
    symbol: "MTK1",
    balance: "1000.0",
    decimals: 18,
  },
  {
    address: "0xYourMintedTokenAddress2",
    name: "My Token 2",
    symbol: "MTK2",
    balance: "2000.0",
    decimals: 18,
  },
  {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    name: "Wrapped Ether",
    symbol: "WETH",
    balance: "5.0",
    decimals: 18,
  },
];

const LiquidityPool: React.FC = () => {
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [lpAmount, setLpAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // 模拟获取代币价格比例（实际应该从合约或预言机获取）
  const getTokenRatio = (tokenA: Token, tokenB: Token): number => {
    // 这里只是示例，实际应该查询链上价格
    const mockPrices: Record<string, number> = {
      UNI: 5.0,
      DAI: 1.0,
      MTK1: 0.5,
      MTK2: 2.0,
      WETH: 2000.0,
    };
    return mockPrices[tokenA.symbol] / mockPrices[tokenB.symbol];
  };

  // 当tokenA或tokenB变化时，自动计算另一个代币的数量
  const calculateAmounts = (baseToken: "A" | "B", amount: string) => {
    if (!tokenA || !tokenB || !amount) {
      setAmountA("");
      setAmountB("");
      return;
    }

    const ratio = getTokenRatio(tokenA, tokenB);

    if (baseToken === "A") {
      setAmountA(amount);
      setAmountB((parseFloat(amount) * ratio).toFixed(6));
    } else {
      setAmountB(amount);
      setAmountA((parseFloat(amount) / ratio).toFixed(6));
    }
  };

  // 添加流动性处理函数
  const handleAddLiquidity = async () => {
    if (!tokenA || !tokenB || !amountA || !amountB) {
      alert("请选择两种代币并输入数量");
      return;
    }

    setIsAdding(true);
    try {
      console.log(`添加流动性: ${amountA} ${tokenA.symbol} 和 ${amountB} ${tokenB.symbol}`);
      console.log("代币A地址:", tokenA.address);
      console.log("代币B地址:", tokenB.address);

      // 模拟合约调用 - 实际应该调用addLiquidity函数
      // await routerContract.addLiquidity(
      //   tokenA.address,
      //   tokenB.address,
      //   amountA,
      //   amountB,
      //   0, // amountAMin
      //   0, // amountBMin
      //   userAddress,
      //   deadline
      // );

      alert(`成功添加 ${amountA} ${tokenA.symbol} 和 ${amountB} ${tokenB.symbol} 流动性`);
      setAmountA("");
      setAmountB("");
    } catch (error) {
      console.error("添加流动性失败:", error);
      alert("添加流动性失败");
    } finally {
      setIsAdding(false);
    }
  };

  // 移除流动性处理函数
  const handleRemoveLiquidity = async () => {
    if (!tokenA || !tokenB || !lpAmount) {
      alert("请选择交易对并输入LP代币数量");
      return;
    }

    setIsRemoving(true);
    try {
      console.log(`移除 ${lpAmount} LP代币`);
      console.log("交易对:", `${tokenA.symbol}/${tokenB.symbol}`);

      // 模拟合约调用 - 实际应该调用removeLiquidity函数
      // await routerContract.removeLiquidity(
      //   tokenA.address,
      //   tokenB.address,
      //   lpAmount,
      //   0, // amountAMin
      //   0, // amountBMin
      //   userAddress,
      //   deadline
      // );

      alert(`成功移除 ${lpAmount} LP代币`);
      setLpAmount("");
    } catch (error) {
      console.error("移除流动性失败:", error);
      alert("移除流动性失败");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 12,
        maxWidth: 500,
        margin: "0 auto",
        backgroundColor: "#fafafa",
      }}
    >
      <h3 style={{ marginBottom: 20, textAlign: "center" }}>Uniswap V2 资金池操作</h3>

      {/* 交易对选择 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {/* 代币A选择 */}
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>代币A:</label>
            <select
              value={tokenA?.address || ""}
              onChange={(e) => {
                const token = mockTokens.find((t) => t.address === e.target.value);
                setTokenA(token || null);
                if (token && tokenB) {
                  calculateAmounts("A", amountA);
                }
              }}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            >
              <option value="">选择代币A</option>
              {mockTokens.map((token) => (
                <option key={`A-${token.address}`} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          {/* 代币B选择 */}
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>代币B:</label>
            <select
              value={tokenB?.address || ""}
              onChange={(e) => {
                const token = mockTokens.find((t) => t.address === e.target.value);
                setTokenB(token || null);
                if (token && tokenA) {
                  calculateAmounts("B", amountB);
                }
              }}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            >
              <option value="">选择代币B</option>
              {mockTokens
                .filter((token) => token.address !== tokenA?.address)
                .map((token) => (
                  <option key={`B-${token.address}`} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* 交易对信息 */}
        {tokenA && tokenB && (
          <div
            style={{
              padding: 12,
              backgroundColor: "#e8f5e8",
              borderRadius: 6,
              border: "1px solid #4CAF50",
              fontSize: 14,
            }}
          >
            <strong>交易对:</strong> {tokenA.symbol}/{tokenB.symbol}
            <br />
            <strong>预估比例:</strong> 1 {tokenA.symbol} = {getTokenRatio(tokenA, tokenB).toFixed(6)} {tokenB.symbol}
          </div>
        )}
      </div>

      {/* 添加流动性部分 */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ marginBottom: 12 }}>添加流动性</h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8 }}>{tokenA?.symbol || "代币A"} 数量:</label>
            <input
              type="number"
              placeholder="0.0"
              value={amountA}
              onChange={(e) => calculateAmounts("A", e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8 }}>{tokenB?.symbol || "代币B"} 数量:</label>
            <input
              type="number"
              placeholder="0.0"
              value={amountB}
              onChange={(e) => calculateAmounts("B", e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          </div>
        </div>

        <button
          onClick={handleAddLiquidity}
          disabled={isAdding || !tokenA || !tokenB || !amountA || !amountB}
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: isAdding ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: isAdding ? "not-allowed" : "pointer",
          }}
        >
          {isAdding ? "添加中..." : "添加流动性"}
        </button>
      </div>

      {/* 移除流动性部分 */}
      <div>
        <h4 style={{ marginBottom: 12 }}>移除流动性</h4>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 8 }}>LP代币数量:</label>
          <input
            type="number"
            placeholder="0.0"
            value={lpAmount}
            onChange={(e) => setLpAmount(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          onClick={handleRemoveLiquidity}
          disabled={isRemoving || !tokenA || !tokenB || !lpAmount}
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: isRemoving ? "#ccc" : "#f44336",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: isRemoving ? "not-allowed" : "pointer",
          }}
        >
          {isRemoving ? "移除中..." : "移除流动性"}
        </button>
      </div>

      {/* 余额信息显示 */}
      {(tokenA || tokenB) && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: "#e3f2fd",
            borderRadius: 6,
            border: "1px solid #2196F3",
            fontSize: 14,
          }}
        >
          <strong>余额信息:</strong>
          <br />
          {tokenA && `${tokenA.symbol}: ${tokenA.balance}`}
          {tokenA && tokenB && " | "}
          {tokenB && `${tokenB.symbol}: ${tokenB.balance}`}
        </div>
      )}
    </div>
  );
};

export default LiquidityPool;
