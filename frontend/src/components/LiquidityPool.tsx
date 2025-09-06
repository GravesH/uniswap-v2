import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract, useSimulateContract } from "wagmi";
import UniswapV2Router02 from "../abi/UniswapV2Router02.json";
import UniswapV2Pair from "../abi/UniswapV2Pair.json";
import { contract_address } from "../pages/constants";
// 模拟的代币类型
interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

// 模拟的代币列表 - 这里只包含代币的基本信息，不包含用户余额
const mockTokens: Token[] = [
  {
    address: "0x883D049624E84eEE66Cbc1a198F961d22b344DDC",
    name: "token1",
    symbol: "token1",
    decimals: 18,
  },
  {
    address: "0xDFe68F52f379d7Ce0a6eFc5d5a58aCE506a40888",
    name: "token3",
    symbol: "token3",
    decimals: 18,
  },
  {
    address: "0x6176Ab4B2A9b3e0Ac828d95B0fB904fd711F7C0d",
    name: "token4",
    symbol: "token4",
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
  const [priceRatio, setPriceRatio] = useState<number | null>(null);

  const { address, isConnected, isDisconnected } = useAccount();
  // 当数量变化时，重新计算价格比例
  useEffect(() => {
    if (tokenA && tokenB && amountA && amountB) {
      const numA = parseFloat(amountA);
      const numB = parseFloat(amountB);

      if (numA > 0 && numB > 0) {
        setPriceRatio(numA / numB);
      } else {
        setPriceRatio(null);
      }
    } else {
      setPriceRatio(null);
    }
  }, [amountA, amountB, tokenA, tokenB]);

  // 当tokenA或tokenB变化时，重置数量
  useEffect(() => {
    setAmountA("");
    setAmountB("");
    setPriceRatio(null);
  }, [tokenA, tokenB]);

  //通过ethers检查用户余额
  const checkoutAllowanceByEther = () => {};
  //通过wagmi检查用户余额
  const checkoutAllowanceByWagmi = () => {};
  // 添加流动性处理函数
  const handleAddLiquidity = async () => {
    if (!tokenA || !tokenB || !amountA || !amountB) {
      alert("请选择两种代币并输入数量");
      return;
    }

    if (parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      alert("输入数量必须大于0");
      return;
    }

    if (isDisconnected) {
      alert("请先连接钱包！");
      return;
    }
    setIsAdding(true);
    try {
      console.log(`创建流动性池: ${amountA} ${tokenA.symbol} 和 ${amountB} ${tokenB.symbol}`);
      console.log("代币A地址:", tokenA.address);
      console.log("代币B地址:", tokenB.address);
      console.log("初始价格比例:", priceRatio);

      // 在真实项目中，这里会：
      // 1. 检查用户是否已连接钱包
      // 2. 检查用户是否有足够的代币余额
      // 3. 请求用户授权代币转账
      // 4. 调用路由合约的 addLiquidity 函数

      alert(`成功创建 ${tokenA.symbol}/${tokenB.symbol} 流动性池`);
      setAmountA("");
      setAmountB("");
      setPriceRatio(null);
    } catch (error) {
      console.error("创建流动性池失败:", error);
      alert("创建流动性池失败");
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

      // 在真实项目中，这里会：
      // 1. 检查用户是否持有足够的LP代币
      // 2. 授权LP代币销毁
      // 3. 调用路由合约的 removeLiquidity 函数

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
      <h3 style={{ marginBottom: 20, textAlign: "center" }}>创建流动性池</h3>

      <div style={{ marginBottom: 16, padding: 12, backgroundColor: "#fff3cd", borderRadius: 6 }}>
        <strong>提示：</strong>请确保你拥有足够的两类代币来创建流动性池
      </div>

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

        {/* 交易对信息和价格比例 */}
        {tokenA && tokenB && priceRatio && (
          <div
            style={{
              padding: 12,
              backgroundColor: "#e8f5e8",
              borderRadius: 6,
              border: "1px solid #4CAF50",
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            <strong>交易对:</strong> {tokenA.symbol}/{tokenB.symbol}
            <br />
            <strong>初始价格设定:</strong>
            <br />1 {tokenA.symbol} = {priceRatio.toFixed(6)} {tokenB.symbol}
            <br />1 {tokenB.symbol} = {(1 / priceRatio).toFixed(6)} {tokenA.symbol}
          </div>
        )}
      </div>

      {/* 添加流动性部分 */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ marginBottom: 12 }}>注入初始流动性</h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8 }}>{tokenA?.symbol || "代币A"} 数量:</label>
            <input
              type="number"
              placeholder="0.0"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              min="0"
              step="any"
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
              onChange={(e) => setAmountB(e.target.value)}
              min="0"
              step="any"
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
          {isAdding ? "创建中..." : "创建流动性池"}
        </button>
      </div>

      {/* 移除流动性部分 - 通常需要用户连接钱包后才能看到 */}
      <div>
        <h4 style={{ marginBottom: 12 }}>移除流动性</h4>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 8 }}>LP代币数量:</label>
          <input
            type="number"
            placeholder="0.0"
            value={lpAmount}
            onChange={(e) => setLpAmount(e.target.value)}
            min="0"
            step="any"
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
    </div>
  );
};

export default LiquidityPool;
