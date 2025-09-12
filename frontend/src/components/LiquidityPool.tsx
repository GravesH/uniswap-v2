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
import UniswapV2Router02Abi from "../abi/UniswapV2Router02.json";
import ERC20Abi from "../abi/ERC20.json";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import UniswapV2FactoryAbi from "../abi/UniswapV2Factory.json";
import UniswapV2PairAbi from "../abi/UniswapV2Pair.json";
import { contract_address } from "../constants/index.ts";
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
    address: "0x856e4424f806D16E8CBC702B3c0F2ede5468eae5",
    name: "t1",
    symbol: "t1",
    decimals: 18,
  },
  {
    address: "0xb0279Db6a2F1E01fbC8483FCCef0Be2bC6299cC3",
    name: "t2",
    symbol: "t2",
    decimals: 18,
  },
  {
    address: "0x3dE2Da43d4c1B137E385F36b400507c1A24401f8",
    name: "t3",
    symbol: "t3",
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
  const [removePercent, setRemovePercent] = useState<number>(0); // 移除比例 %
  const [isRemoving, setIsRemoving] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [provider1, setProvider1] = useState<ethers.JsonRpcProvider | null>(
    null
  );
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

  const fetchBalance = async (token_address: string, decimals: number) => {
    const signer = await provider?.getSigner();
    const address = await signer?.getAddress();
    const tokenContract = new ethers.Contract(
      token_address as `0x${string}`,
      UniswapV2PairAbi,
      provider!
    );
    const balance = await tokenContract.balanceOf(address);
    return ethers.formatUnits(balance, decimals);
  };

  const checkoutAllowance = async () => {
    if (!tokenA || !tokenB) return;

    const balances = [];
    for (const token of [tokenA, tokenB]) {
      const balance = await fetchBalance(
        token.address as `0x${string}`,
        token.decimals
      );
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
    args: [
      address as `0x${string}`,
      contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`,
    ],
  });

  const { data: allowanceB } = useReadContract({
    address: tokenB?.address as `0x${string}` | undefined,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [
      address as `0x${string}`,
      contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`,
    ],
  });

  useWatchContractEvent({
    address: contract_address.UNISWAP_V2_PAIR as
      | `0x${string}`
      | `0x${string}`[]
      | undefined,
    abi: UniswapV2PairAbi,
    eventName: "Transfer",
    onLogs(logs) {
      console.log("监听到 Transfer 事件，流动性操作成功！", logs);
    },
  });

  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`,
    abi: UniswapV2Router02Abi,
    functionName: "addLiquidity",
    args:
      tokenA &&
      tokenB &&
      isValidNumber(amountA) &&
      isValidNumber(amountB) &&
      address
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
      enabled:
        !!tokenA &&
        !!tokenB &&
        isValidNumber(amountA) &&
        isValidNumber(amountB) &&
        !!address,
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
    const amountANums = isValidNumber(amountA)
      ? ethers.parseUnits(amountA, tokenA?.decimals || 18)
      : 0n;
    const amountBNums = isValidNumber(amountB)
      ? ethers.parseUnits(amountB, tokenB?.decimals || 18)
      : 0n;

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
        args: [
          contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`,
          amountANums,
        ],
      });
      const receipt = await waitForTransactionReceipt(publicClient, {
        hash: tx,
      });
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
        args: [
          contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`,
          amountBNums,
        ],
      });
      const receipt = await waitForTransactionReceipt(publicClient, {
        hash: tx,
      });
      console.log("receiptB:", receipt);
      if (receipt?.status !== "success") {
        console.error("B 授权失败");
        return;
      }
      console.log("B 授权成功");
    }
  };
  // 只保留当前选中的交易对信息
  const [currentPairInfo, setCurrentPairInfo] = useState<{
    address: string | null;
    reserves: { reserveA: string; reserveB: string } | null;
    priceAB: number | null;
    priceBA: number | null;
  }>({
    address: null,
    reserves: null,
    priceAB: null,
    priceBA: null,
  });
  const [totalSupply, setTotalSupply] = useState<string>("0");
  //查询LP Token余额
  const fetchLPBalance = async (addr: string): Promise<string> => {
    if (!addr || !address || !provider) return "0";

    try {
      const pairContract = new ethers.Contract(
        addr as `0x${string}`,
        UniswapV2PairAbi,
        provider
      );

      //获取当前pair的 总份额
      const totalSupply = await pairContract.totalSupply();
      console.log("LP 总份额:", ethers.formatUnits(totalSupply, 18));
      setTotalSupply(ethers.formatUnits(totalSupply, 18));
      // 获取 LP 代币余额
      const balance = await pairContract.balanceOf(address);
      const decimals = await pairContract.decimals().catch(() => 18); // 默认18位小数
      console.log("LP 余额:", ethers.formatUnits(balance, decimals));
      setLpAmount(ethers.formatUnits(balance, decimals));
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("获取 LP 余额失败:", error);
      return "0";
    }
  };

  //计算用户池子份额
  const calculatePoolShare = (): string => {
    if (!lpAmount || !totalSupply || totalSupply === "0") return "0";
    const share = (parseFloat(lpAmount) / parseFloat(totalSupply)) * 100;
    return share.toFixed(4);
  };
  //查询当前交易对 地址
  const fetchPairAddress = async () => {
    if (!provider || !tokenA || !tokenB) return;
    console.log("fetchPairAddress:", tokenA, tokenB);
    // 1. 查询Pair地址
    const factoryContract = new ethers.Contract(
      contract_address.UNISWAP_V2_FACTORY,
      UniswapV2FactoryAbi,
      provider
    );

    const pairAddress = await factoryContract.getPair(
      tokenA?.address,
      tokenB?.address
    );
    return pairAddress;
  };
  // 实时查询函数
  const fetchCurrentPairInfo = async (tokenA: Token, tokenB: Token) => {
    console.log("fetchCurrentPairInfo:", tokenA, tokenB);
    if (!provider) return;

    try {
      const pairAddress = await fetchPairAddress();
      //每一个交易对都是一个  pair合约实例  通过对应合约地址实例查询当前交易对信息
      console.log("pairAddress:", pairAddress);
      if (pairAddress === ethers.ZeroAddress) {
        setCurrentPairInfo({
          address: null,
          reserves: null,
          priceAB: null,
          priceBA: null,
        });
        return;
      }
      await fetchLPBalance(pairAddress);

      // 2. 查询储备量和价格
      const pairContract = new ethers.Contract(
        pairAddress,
        UniswapV2PairAbi,
        provider
      );
      console.log("pairContract:", pairContract);
      const [reservesData, token0Address] = await Promise.all([
        pairContract.getReserves(),
        pairContract.token0(),
      ]);
      console.log("reservesData:", reservesData, token0Address);
      const isTokenA0 =
        token0Address.toLowerCase() === tokenA.address.toLowerCase();
      // 按 UI 的 A/B 顺序取出对应的储备量并用对应 decimals 格式化
      const reserveAraw = isTokenA0 ? reservesData[0] : reservesData[1];
      const reserveBraw = isTokenA0 ? reservesData[1] : reservesData[0];

      const reserveA = ethers.formatUnits(reserveAraw, tokenA.decimals);
      const reserveB = ethers.formatUnits(reserveBraw, tokenB.decimals);
      const priceAB = Number(reserveB) / Number(reserveA); // 1 A = ? B
      const priceBA = Number(reserveA) / Number(reserveB); // 1 B = ? A
      setCurrentPairInfo({
        address: pairAddress,
        reserves: { reserveA, reserveB },
        priceAB,
        priceBA,
      });
    } catch (error) {
      console.error("查询交易对信息失败:", error);
      setCurrentPairInfo({
        address: null,
        reserves: null,
        priceAB: null,
        priceBA: null,
      });
    }
  };
  // 当代币选择变化时实时查询
  useEffect(() => {
    if (tokenA && tokenB) {
      fetchCurrentPairInfo(tokenA, tokenB);
    } else {
      setCurrentPairInfo({
        address: null,
        reserves: null,
        priceAB: null,
        priceBA: null,
      });
    }
  }, [tokenA, tokenB, provider]);
  const handleAddLiquidity = async () => {
    if (
      !tokenA ||
      !tokenB ||
      !isValidNumber(amountA) ||
      !isValidNumber(amountB)
    ) {
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

      setTimeout(async () => {
        const tx = await writeContractAsync({
          address: contract_address.UNISWAP_V2_ROUTER_02 as `0x${string}`,
          abi: UniswapV2Router02Abi,
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
        const receipt = await waitForTransactionReceipt(publicClient, {
          hash: tx,
        });
        if (receipt.status === "success") {
          console.log("交易已确认:", receipt);
          console.log("流动性池创建成功");
          // 添加延迟以确保区块链状态更新
          setTimeout(async () => {
            if (tokenA && tokenB) {
              console.log("开始查询新创建的池子信息...");
              await fetchCurrentPairInfo(tokenA, tokenB);
            }
          }, 3000); // 等待3秒让区块链状态更新
          setAmountA("");
          setAmountB("");
        }
      }, 1000); // 模拟网络延迟
    } catch (error) {
      console.error("创建流动性池失败:", error);
      if (error?.details) {
        console.error("错误详情:", error.details);
      }
      if (error?.data) {
        console.error("错误数据:", error.data);
      }
      alert("创建流动性池失败");
    } finally {
      setIsAdding(false);
    }
  };
  //根据代币A数量自动计算代币B数量
  // 自动根据输入的一种代币计算另一种
  const autoMatchRatio = (inputValue: string, inputType: "A" | "B") => {
    if (!currentPairInfo.priceAB || !tokenA || !tokenB) return;

    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) {
      setAmountA("");
      setAmountB("");
      return;
    }

    if (inputType === "A") {
      setAmountB((value * currentPairInfo.priceAB).toFixed(6));
    } else {
      setAmountA((value / currentPairInfo.priceAB).toFixed(6));
    }
  };
  const handlePercentClick = (percent: number) => {
    setRemovePercent(percent);
    if (lpAmount) {
      const lpToRemove = (parseFloat(lpAmount) * percent) / 100;
      setLpAmount(lpToRemove.toString());
    }
  };
  const handleRemoveLiquidity = async () => {
    if (!tokenA || !tokenB || !isValidNumber(lpAmount)) {
      alert("请选择交易对并输入有效LP代币数量");
      return;
    }
    if (isDisconnected) {
      openConnectModal && openConnectModal();
      return;
    }
    try {
      setIsRemoving(true);

      //授权router 移除LP
      const pairAddress = await fetchPairAddress();
      if (!pairAddress) {
        alert("未找到对应的交易对地址");
        setIsRemoving(false);
        return;
      }
      //这个provider 不支持 sendTransaction  也就是说不能发起交易 只能读区块链数据！！
      // const pairContract = new ethers.Contract(
      //   pairAddress,
      //   UniswapV2PairAbi,
      //   provider!
      // );
      // 获取 signer（确保用户已连接钱包）
      const signer = await provider!.getSigner();
      console.log("signer:", ethers.parseUnits(lpAmount, 18), signer);
      // 用 signer 创建可写的 contract
      const pairWithSigner = new ethers.Contract(
        pairAddress,
        UniswapV2PairAbi,
        signer
      );
      // 授权路由合约花费LP代币
      const approveTx = await pairWithSigner.approve(
        contract_address.UNISWAP_V2_ROUTER_02,
        ethers.parseUnits(lpAmount, 18)
      );
      console.log("LP 授权交易已发送，等待确认...", approveTx);
      const approveReceipt = await waitForTransactionReceipt(publicClient, {
        hash: approveTx.hash,
      });
      console.log("LP 授权交易已确认:", approveReceipt);
      if (approveReceipt?.status !== "success") {
        console.error("LP 授权失败");
        return;
      }
      //路由合约 移除LP
      const routerWithSigner = new ethers.Contract(
        contract_address.UNISWAP_V2_ROUTER_02,
        UniswapV2Router02Abi,
        signer
      );
      const tx = await routerWithSigner.removeLiquidity(
        tokenA.address,
        tokenB.address,
        ethers.parseUnits(lpAmount, 18),
        0n,
        0n,
        address,
        Math.floor(Date.now() / 1000) + 60 * 20
      );
      console.log("移除流动性交易已发送，等待确认...", tx);
      const receipt = await waitForTransactionReceipt(publicClient, {
        hash: tx.hash,
      });
      console.log("移除流动性交易已确认:", receipt);
      if (receipt?.status === "success") {
        console.log("移除流动性成功");
        await fetchCurrentPairInfo(tokenA, tokenB);
        //更新LP余额
        await fetchLPBalance(pairAddress);
      } else {
        console.error("移除流动性失败");
        return;
      }
      setLpAmount("");
    } catch (error) {
      console.error("移除流动性失败:", error);
    } finally {
      setIsRemoving(false);
    }
  };
  const validateLiquidityRatio = (
    amountA: string,
    amountB: string,
    tokenA: Token | null,
    tokenB: Token | null,
    currentPrice: number | null
  ): { isValid: boolean; message: string; suggestedAmountB?: string } => {
    if (!tokenA || !tokenB || !amountA || !amountB || !currentPrice) {
      return { isValid: false, message: "请先选择代币并输入数量" };
    }

    const numA = parseFloat(amountA);
    const numB = parseFloat(amountB);

    if (numA <= 0 || numB <= 0) {
      return { isValid: false, message: "数量必须大于0" };
    }

    // 计算预期的B数量（基于当前价格）
    const expectedB = numA * currentPrice;
    const deviation = Math.abs((numB - expectedB) / expectedB);

    // 允许0.1%的精度误差（考虑到浮点数计算）
    if (deviation > 0.001) {
      return {
        isValid: false,
        message: `比例不匹配！当前价格: 1 ${
          tokenA.symbol
        } = ${currentPrice.toFixed(6)} ${tokenB.symbol}`,
        suggestedAmountB: expectedB.toFixed(6),
      };
    }

    return { isValid: true, message: "比例正确" };
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

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          backgroundColor: "#fff3cd",
          borderRadius: 6,
        }}
      >
        <strong>提示：</strong>请确保你拥有足够的两类代币来创建流动性池
      </div>
      {tokenA && tokenB && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#e7f3ff",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4>
              {tokenA.symbol}/{tokenB.symbol} 池子信息
            </h4>
            <button
              onClick={() => fetchCurrentPairInfo(tokenA, tokenB)}
              style={{ padding: "4px 8px", fontSize: "12px" }}
            >
              刷新
            </button>
          </div>

          {currentPairInfo.address ? (
            <>
              <p>
                <strong>池子地址:</strong>{" "}
                {`${currentPairInfo.address.substring(
                  0,
                  6
                )}...${currentPairInfo.address.substring(
                  currentPairInfo.address.length - 4
                )}`}
              </p>

              {currentPairInfo.reserves && currentPairInfo.priceAB && (
                <>
                  <p>
                    <strong>储备量:</strong> {tokenA?.symbol}:{" "}
                    {currentPairInfo.reserves.reserveA} / {tokenB?.symbol}:{" "}
                    {currentPairInfo.reserves.reserveB}
                  </p>
                  <p>
                    价格比例: 1 {tokenA?.symbol} = {currentPairInfo.priceAB}{" "}
                    {tokenB?.symbol}
                  </p>
                  <p>
                    反向价格: 1 {tokenB?.symbol} = {currentPairInfo.priceBA}{" "}
                    {tokenA?.symbol}
                  </p>
                </>
              )}
            </>
          ) : (
            <p>该交易对尚未创建流动性池</p>
          )}
        </div>
      )}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}
            >
              代币A:
            </label>
            <select
              value={tokenA?.address || ""}
              onChange={(e) => {
                const token = mockTokens.find(
                  (t) => t.address === e.target.value
                );
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
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}
            >
              代币B:
            </label>
            <select
              value={tokenB?.address || ""}
              onChange={(e) => {
                const token = mockTokens.find(
                  (t) => t.address === e.target.value
                );
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
      </div>

      <div style={{ marginBottom: 20 }}>
        <h4 style={{ marginBottom: 12 }}>
          {currentPairInfo.address ? "注入流动性" : "注入初始流动性"}
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 8 }}>
              {tokenA?.symbol || "代币A"} 数量:
            </label>
            <input
              type="number"
              placeholder="0.0"
              disabled={!tokenA || !tokenB}
              value={amountA}
              onChange={(e) => {
                setAmountA(e.target.value);
                autoMatchRatio(e.target.value, "A");
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
            <label style={{ display: "block", marginBottom: 8 }}>
              {tokenB?.symbol || "代币B"} 数量:
            </label>
            <input
              type="number"
              placeholder="0.0"
              disabled={!tokenA || !tokenB}
              value={amountB}
              onChange={(e) => {
                setAmountB(e.target.value);
                autoMatchRatio(e.target.value, "B");
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
            {/* {currentPairInfo.price && (
              <button
                onClick={autoFillAmountB}
                style={{ padding: "4px 8px", fontSize: "12px" }}
                title="按照当前价格自动填充"
              >
                自动匹配
              </button>
            )} */}
          </div>
        </div>
        {address && isConnected ? (
          <button
            onClick={handleAddLiquidity}
            disabled={
              isAdding ||
              !tokenA ||
              !tokenB ||
              !isValidNumber(amountA) ||
              !isValidNumber(amountB) ||
              !validateLiquidityRatio(
                amountA,
                amountB,
                tokenA,
                tokenB,
                currentPairInfo.priceAB
              ).isValid
            }
            style={{
              width: "100%",
              padding: 12,
              backgroundColor:
                isAdding ||
                !validateLiquidityRatio(
                  amountA,
                  amountB,
                  tokenA,
                  tokenB,
                  currentPairInfo.priceAB
                ).isValid
                  ? "#ccc"
                  : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: isAdding ? "not-allowed" : "pointer",
            }}
          >
            {isAdding ? "创建中..." : "创建流动性池"}
          </button>
        ) : (
          <button
            style={{ width: "100%", marginTop: 8 }}
            onClick={openConnectModal}
          >
            连接钱包
          </button>
        )}
      </div>

      {tokenA && tokenB && (
        <div style={{ marginTop: 30 }}>
          <h3>移除流动性</h3>
          <p>你当前 LP 余额: {lpAmount}</p>

          <div style={{ marginBottom: 10 }}>
            <label>输入百分比：</label>
            <input
              type="number"
              min="0"
              max="100"
              value={removePercent}
              onChange={(e) => handlePercentClick(Number(e.target.value))}
              style={{ width: "80px", marginRight: "10px" }}
            />
            %
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: 10 }}>
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                onClick={() => handlePercentClick(p)}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: removePercent === p ? "#007bff" : "#f9f9f9",
                  color: removePercent === p ? "#fff" : "#000",
                }}
              >
                {p}%
              </button>
            ))}
          </div>

          <button
            onClick={handleRemoveLiquidity}
            disabled={isRemoving || removePercent <= 0}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {isRemoving ? "移除中..." : "确认移除"}
          </button>
        </div>
      )}
    </div>
  );
};

export default LiquidityPool;
