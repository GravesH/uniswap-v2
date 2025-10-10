import React, { useState, useEffect } from "react";
import TokenSelector from "./TokenSelector";
import { useAccount } from "wagmi";
import { useTokenStore } from "../store/tokenStore";
import { getAmountOutWithFee } from "../utils";
import { parseUnits, formatUnits, ethers } from "ethers";
import UniswapV2PairAbi from "../abi/UniswapV2Pair.json";
import UniswapV2FactoryAbi from "../abi/UniswapV2Factory.json";
import { contract_address } from "../constants/index";
import UniswapV2Router02Abi from "../abi/UniswapV2Router02.json";
import { waitForTransactionReceipt } from "viem/actions";
import ERC20Abi from "../abi/ERC20.json";
import { usePublicClient } from "wagmi";

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
  const publicClient = usePublicClient();

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setProvider(new ethers.BrowserProvider((window as any).ethereum));
    }
  }, []);

  useEffect(() => {
    if (!provider || !tokenIn || !tokenOut || !amountIn) {
      setAmountOut("");
      setFee("");
      return;
    }
    const updateEstimation = async () => {
      try {
        const factoryContract = new ethers.Contract(contract_address.UNISWAP_V2_FACTORY, UniswapV2FactoryAbi, provider);
        const pairAddress = await factoryContract.getPair(tokenIn?.address || "", tokenOut?.address || "");
        if (!pairAddress || pairAddress === ethers.ZeroAddress) {
          setAmountOut("");
          setFee("");
          setPairExists(false);
          setError("当前代币对暂无流动性，无法兑换");
          return;
        }
        setPairExists(true);
        setError("");

        const pairContract = new ethers.Contract(pairAddress, UniswapV2PairAbi, provider);
        const [reserves, token0Address] = await Promise.all([pairContract.getReserves(), pairContract.token0()]);
        const isTokenInToken0 = tokenIn.address === token0Address;
        const reserveIn = isTokenInToken0 ? reserves[0] : reserves[1];
        const reserveOut = isTokenInToken0 ? reserves[1] : reserves[0];

        const amountInParsed = parseUnits(amountIn, tokenIn.decimals);
        const { amountOut, feeAmount } = getAmountOutWithFee(amountInParsed, reserveIn, reserveOut);
        console.log("amountOut:", amountOut, "reserveOut:", reserveOut, amountOut > reserveOut);
        // 最大输入量限制（可按策略）
        const maxInput = (reserveIn * BigInt(90)) / BigInt(100); // 例如 90% 的池子储量
        if (amountInParsed > maxInput) {
          setAmountOut("");
          setFee("");
          setError(`输入数量过大，建议最大输入 ${formatUnits(maxInput, tokenIn.decimals)} ${tokenIn.symbol}`);
          return;
        }

        setAmountOut(formatUnits(amountOut, tokenOut.decimals));
        setFee(formatUnits(feeAmount, tokenIn.decimals));
      } catch (err) {
        console.error("计算预估失败", err);
        setAmountOut("");
        setFee("");
        setError("计算预估失败，请重试");
      }
    };

    updateEstimation();
  }, [amountIn, tokenIn, tokenOut, provider]);

  const checkAllowance = async () => {
    if (!tokenIn || !tokenIn.address) {
      setError("请选择支付代币");
      return false;
    }
    if (!address) {
      setError("钱包未连接");
      return false;
    }
    if (!contract_address.UNISWAP_V2_ROUTER_02) {
      setError("路由地址未配置");
      return false;
    }
    const tokenContract = new ethers.Contract(tokenIn?.address || "", ERC20Abi, provider);
    const allowance = await tokenContract.allowance(address, contract_address.UNISWAP_V2_ROUTER_02);
    if (allowance < parseUnits(amountIn, tokenIn?.decimals)) {
      setError("请先授权");
      return false;
    }
    return true;
  };

  const handleApprove = async () => {
    const signer = await provider!.getSigner();
    const tokenContract = new ethers.Contract(tokenIn?.address || "", ERC20Abi, signer);
    const approvalTx = await tokenContract.approve(contract_address.UNISWAP_V2_ROUTER_02, parseUnits(amountIn, tokenIn?.decimals));
    await approvalTx.wait();
    if (!publicClient) return;
    const approveReceipt = await waitForTransactionReceipt(publicClient, { hash: approvalTx.hash });
    if (approveReceipt?.status !== "success") {
      setError("LP 授权失败");
      return;
    }
  };

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !provider) {
      setError("请选择代币并输入数量");
      return;
    }
    if (!amountOut) {
      setError("输入数量过大");
      return;
    }
    setLoading(true);
    try {
      const isApproved = await checkAllowance();
      if (!isApproved) await handleApprove();
      const signer = await provider.getSigner();
      const routerContract = new ethers.Contract(contract_address.UNISWAP_V2_ROUTER_02, UniswapV2Router02Abi, signer);
      const tx = await routerContract.swapExactTokensForTokens(
        parseUnits(amountIn, tokenIn.decimals),
        0,
        [tokenIn.address, tokenOut.address],
        address,
        Date.now() + 1000 * 60 * 10
      );
      await tx.wait();
      if (!publicClient) return;
      const receipt = await waitForTransactionReceipt(publicClient, { hash: tx.hash });
      if (receipt?.status !== "success") {
        setError("兑换交易失败");
        return;
      }
      setError("");
      alert("兑换成功！");
    } catch (err) {
      setError("兑换失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 max-w-xl mx-auto space-y-4">
      <h3 className="text-xl font-bold text-center">兑换</h3>

      {/* 支付代币 */}
      <TokenSelector label="支付代币" tokens={tokens} selectedToken={tokenIn} onSelect={setTokenIn} />
      <input
        type="number"
        placeholder="输入数量"
        value={amountIn}
        onChange={(e) => setAmountIn(e.target.value)}
        className="input-neon mt-2 mb-4"
      />

      {/* 获得代币 */}
      <TokenSelector label="获得代币" tokens={tokens} selectedToken={tokenOut} onSelect={setTokenOut} />
      <input type="number" placeholder="预估获得数量" value={amountOut} disabled className="input-neon mt-2 mb-2 opacity-80" />

      {/* 手续费显示 */}
      {fee && tokenIn && (
        <p className="text-sm text-slate-400 mb-2">
          手续费:{" "}
          <span className="badge-soft">
            {fee} {tokenIn.symbol}
          </span>
        </p>
      )}

      {/* 错误提示 */}
      {error && <p className="text-red-400 font-medium">{error}</p>}

      {/* Swap 按钮 */}
      {isConnected && address && (
        <button
          onClick={handleSwap}
          disabled={!pairExists || loading || !tokenIn || !tokenOut || !amountIn}
          className="btn-neon w-full mt-2"
        >
          {loading ? "兑换中..." : "Swap"}
        </button>
      )}
    </div>
  );
};

export default SwapForm;
