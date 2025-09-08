import React, { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
  useSimulateContract,
  usePublicClient,
} from "wagmi";
import UniswapV2Router02 from "../abi/UniswapV2Router02.json";
import ERC20Abi from "../abi/ERC20.json";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import UniswapV2Pair from "../abi/UniswapV2Pair.json";
import { contract_address } from "../pages/constants";
import { ethers } from "ethers";
import { waitForTransactionReceipt } from "viem/actions";

const SEPOLIA_NODE_URL = `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`;

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

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
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [lpAmount, setLpAmount] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [priceRatio, setPriceRatio] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [provider1, setProvider1] = useState<ethers.JsonRpcProvider | null>(null);

  const { address, isConnected, isDisconnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { writeContractAsync, data: writeData, isPending } = useWriteContract();

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setProvider(new ethers.BrowserProvider((window as any).ethereum));
    }
    setProvider1(new ethers.JsonRpcProvider(SEPOLIA_NODE_URL));
  }, []);

  const isValidNumber = (value: string) => {
    return value !== "" && !isNaN(Number(value)) && Number(value) > 0;
  };

  useEffect(() => {
    if (tokenA && tokenB && isValidNumber(amountA) && isValidNumber(amountB)) {
      const numA = parseFloat(amountA);
      const numB = parseFloat(amountB);
      setPriceRatio(numA / numB);
    } else {
      setPriceRatio(null);
    }
  }, [amountA, amountB, tokenA, tokenB]);

  useEffect(() => {
    setAmountA("");
    setAmountB("");
    setPriceRatio(null);
  }, [tokenA, tokenB]);

  const fetchBalance = async (token_address: string, decimals: number) => {
    const signer = await provider?.getSigner();
    const address = await signer?.getAddress();
    const tokenContract = new ethers.Contract(token_address as `0x${string}`, UniswapV2Pair, provider!);
    const balance = await tokenContract.balanceOf(address);
    return ethers.formatUnits(balance, decimals);
  };

  const checkoutAllowance = async () => {
    if (!tokenA || !tokenB) return;

    const balances = [];
    for (const token of [tokenA, tokenB]) {
      const balance = await fetchBalance(token.address as `0x${string}`, token.decimals);
      balances.push(balance);
    }

    if (balances.some((b) => parseFloat(b) <= 0)) {
      alert("请确保你拥有足够的代币");
      return;
    }
  };

  const { data: allowanceA } = useReadContract({
    address: tokenA?.address as `0x${string}` | undefined,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [address as `0x${string}`, contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`],
  });

  const { data: allowanceB } = useReadContract({
    address: tokenB?.address as `0x${string}` | undefined,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [address as `0x${string}`, contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`],
  });

  useWatchContractEvent({
    address: contract_address.UNISWAP_V2_PAIR as `0x${string}` | `0x${string}`[] | undefined,
    abi: UniswapV2Pair,
    eventName: "Transfer",
    onLogs(logs) {
      console.log("监听到 Transfer 事件，流动性操作成功！", logs);
    },
  });

  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`,
    abi: UniswapV2Router02,
    functionName: "addLiquidity",
    args:
      tokenA && tokenB && isValidNumber(amountA) && isValidNumber(amountB) && address
        ? [
            tokenA.address,
            tokenB.address,
            ethers.parseUnits(amountA, tokenA.decimals),
            ethers.parseUnits(amountB, tokenB.decimals),
            (ethers.parseUnits(amountA, tokenA.decimals) * 99n) / 100n,
            (ethers.parseUnits(amountB, tokenB.decimals) * 99n) / 100n,
            address,
            BigInt(Math.floor(Date.now() / 1000) + 1200),
          ]
        : undefined,
    query: {
      enabled: !!tokenA && !!tokenB && isValidNumber(amountA) && isValidNumber(amountB) && !!address,
    },
  });

  useEffect(() => {
    console.log("Simulation error:", simulateError);
    console.log("Simulation data:", simulateData);
  }, [simulateError, simulateData]);
  useEffect(() => {
    console.log("tokenA:", tokenA);
    console.log("tokenB:", tokenB);
  }, [tokenA, tokenB]);
  const handleApprove = async () => {
    const amountANums = isValidNumber(amountA) ? ethers.parseUnits(amountA, tokenA?.decimals || 18) : 0n;
    const amountBNums = isValidNumber(amountB) ? ethers.parseUnits(amountB, tokenB?.decimals || 18) : 0n;

    console.log("amountANums:", amountANums);
    console.log("amountBNums:", amountBNums);
    console.log("Current allowanceA:", allowanceA);
    console.log("Current allowanceB:", allowanceB);
    if (!allowanceA || BigInt(allowanceA) < amountANums) {
      console.log("A需要授权，发送授权请求...");
      const tx = await writeContractAsync({
        address: tokenA?.address as `0x${string}`,
        abi: ERC20Abi,
        functionName: "approve",
        args: [contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`, amountANums],
      });
      const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
      console.log("receiptA:", receipt);
      if (receipt?.status !== "success") {
        console.error("A 授权失败");
        return;
      }
      console.log("A 授权成功");
    }

    if (!allowanceB || BigInt(allowanceB) < amountBNums) {
      console.log("B需要授权，发送授权请求...");
      const tx = await writeContractAsync({
        address: tokenB?.address as `0x${string}`,
        abi: ERC20Abi,
        functionName: "approve",
        args: [contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`, amountBNums],
      });
      const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
      console.log("receiptB:", receipt);
      if (receipt?.status !== "success") {
        console.error("B 授权失败");
        return;
      }
      console.log("B 授权成功");
    }
  };

  const handleAddLiquidity = async () => {
    if (!tokenA || !tokenB || !isValidNumber(amountA) || !isValidNumber(amountB)) {
      alert("请选择两种代币并输入有效数量");
      return;
    }

    if (isDisconnected) {
      alert("请先连接钱包！");
      return;
    }

    await checkoutAllowance();
    await handleApprove();
    setIsAdding(true);

    try {
      const amountADesired = ethers.parseUnits(amountA, tokenA.decimals);
      const amountBDesired = ethers.parseUnits(amountB, tokenB.decimals);
      const amountAMin = (amountADesired * 99n) / 100n;
      const amountBMin = (amountBDesired * 99n) / 100n;

      const tx = await writeContractAsync({
        address: contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`,
        abi: UniswapV2Router02,
        functionName: "addLiquidity",
        args: [
          tokenA.address as `0x${string}`,
          tokenB.address as `0x${string}`,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          address as `0x${string}`,
          Math.floor(Date.now() / 1000) + 60 * 20,
        ],
      });

      console.log("添加流动性交易已发送，等待确认...", tx);
      const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
      if (receipt) {
        console.log("交易已确认:", receipt);
        console.log("流动性池创建成功");
        setAmountA("");
        setAmountB("");
        setPriceRatio(null);
      }
    } catch (error) {
      console.error("创建流动性池失败:", error);
      alert("创建流动性池失败");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!tokenA || !tokenB || !isValidNumber(lpAmount)) {
      alert("请选择交易对并输入有效LP代币数量");
      return;
    }

    setIsRemoving(true);
    try {
      console.log(`移除 ${lpAmount} LP代币`);
      console.log("交易对:", `${tokenA.symbol}/${tokenB.symbol}`);
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

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
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

      <div style={{ marginBottom: 20 }}>
        <h4 style={{ marginBottom: 12 }}>注入初始流动性</h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8 }}>{tokenA?.symbol || "代币A"} 数量:</label>
            <input
              type="number"
              placeholder="0.0"
              value={amountA}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                  setAmountA(value);
                }
              }}
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
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                  setAmountB(value);
                }
              }}
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
        {address && isConnected ? (
          <button
            onClick={handleAddLiquidity}
            disabled={isAdding}
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
        ) : (
          <button style={{ width: "100%", marginTop: 8 }} onClick={openConnectModal}>
            连接钱包
          </button>
        )}
      </div>

      <div>
        <h4 style={{ marginBottom: 12 }}>移除流动性</h4>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 8 }}>LP代币数量:</label>
          <input
            type="number"
            placeholder="0.0"
            value={lpAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                setLpAmount(value);
              }
            }}
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
          disabled={isRemoving || !tokenA || !tokenB || !isValidNumber(lpAmount)}
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
