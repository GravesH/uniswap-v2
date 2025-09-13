import React, { useState, useEffect } from "react";
import TokenSelector from "./TokenSelector";
import { useAccount } from "wagmi";
import { useTokenStore } from "../store/tokenStore";
import { getAmountOutWithFee } from "../utils";
import { parseUnits, formatUnits, ethers } from "ethers";
import UniswapV2PairAbi from "../abi/UniswapV2Pair.json";
import UniswapV2FactoryAbi from "../abi/UniswapV2Factory.json";
import { contract_address } from "../constants/index";

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

const SwapForm: React.FC = () => {
  const { isConnected, address } = useAccount();
  const tokens = useTokenStore((s) => s.tokens);

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [tokenIn, setTokenIn] = useState<Token | null>(null);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pairExists, setPairExists] = useState(true);
  // 初始化 provider
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setProvider(new ethers.BrowserProvider((window as any).ethereum));
    }
  }, []);

  // 获取 pair、储备量并计算预估
  useEffect(() => {
    if (!provider || !tokenIn || !tokenOut || !amountIn) {
      setAmountOut("");
      setFee("");
      return;
    }
    console.log(tokenIn, tokenOut, amountIn, "tokenIn, tokenOut, amountIn");
    const updateEstimation = async () => {
      try {
        const factoryContract = new ethers.Contract(
          contract_address.UNISWAP_V2_FACTORY,
          UniswapV2FactoryAbi,
          provider
        );
        const pairAddress = await factoryContract.getPair(
          tokenIn?.address || "",
          tokenOut?.address || ""
        );
        console.log(pairAddress, "pairAddress");
        if (!pairAddress || pairAddress === ethers.ZeroAddress) {
          setAmountOut("");
          setFee("");
          setPairExists(false);
          setError("当前代币对暂无流动性，无法兑换");
          return;
        }
        setPairExists(true);
        setError(""); // pair 存在，清除错误提示
        const pairContract = new ethers.Contract(
          pairAddress,
          UniswapV2PairAbi,
          provider
        );

        const [reserves, token0Address] = await Promise.all([
          pairContract.getReserves(),
          pairContract.token0(),
        ]);
        //判断输入的是哪个代币
        const isTokenInToken0 = tokenIn.address === token0Address;
        const reserveIn = isTokenInToken0 ? reserves[0] : reserves[1];
        const reserveOut = isTokenInToken0 ? reserves[1] : reserves[0];

        const amountInParsed = parseUnits(amountIn, tokenIn.decimals);
        const { amountOut, feeAmount } = getAmountOutWithFee(
          amountInParsed,
          reserveIn,
          reserveOut
        );

        setAmountOut(formatUnits(amountOut, tokenOut.decimals));
        setFee(formatUnits(feeAmount, tokenIn.decimals));
      } catch (err) {
        console.error("计算预估失败", err);
        setAmountOut("");
        setFee("");
      }
    };

    updateEstimation();
  }, [amountIn, tokenIn, tokenOut, provider]);

  // 点击 Swap
  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !provider) {
      setError("请选择代币并输入数量");
      return;
    }

    setLoading(true);
    try {
      // ⚠️ TODO: 替换为实际合约调用
      console.log(`Swap ${amountIn} ${tokenIn.symbol} -> ${tokenOut.symbol}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setError("");
      alert("兑换成功！");
    } catch (err) {
      console.error(err);
      setError("兑换失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 16,
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <h3 style={{ marginBottom: 16 }}>兑换</h3>

      {/* 支付代币 */}
      <TokenSelector
        label="支付代币"
        tokens={tokens}
        selectedToken={tokenIn}
        onSelect={setTokenIn}
      />
      <input
        type="number"
        placeholder="输入数量"
        value={amountIn}
        onChange={(e) => setAmountIn(e.target.value)}
        style={{ width: "100%", marginTop: 8, marginBottom: 16, padding: 8 }}
      />

      {/* 获得代币 */}
      <TokenSelector
        label="获得代币"
        tokens={tokens}
        selectedToken={tokenOut}
        onSelect={setTokenOut}
      />
      <input
        type="number"
        placeholder="预估获得数量"
        value={amountOut}
        style={{ width: "100%", marginTop: 8, marginBottom: 8, padding: 8 }}
        disabled
      />

      {/* 手续费显示 */}
      {fee && tokenIn && (
        <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
          手续费: {fee} {tokenIn.symbol}
        </p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {isConnected && address && (
        <button
          style={{ marginTop: 16, width: "100%", padding: 12, borderRadius: 8 }}
          onClick={handleSwap}
          disabled={
            !pairExists || loading || !tokenIn || !tokenOut || !amountIn
          }
        >
          {loading ? "兑换中..." : "Swap"}
        </button>
      )}
    </div>
  );
};

export default SwapForm;
