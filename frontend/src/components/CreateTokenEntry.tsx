import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  useAccount,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
  useSimulateContract,
  usePublicClient,
  useDisconnect,
} from "wagmi";
import TokenFactoryAbi from "../abi/TokenFactory.json";
import { contract_address } from "../constants/index";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { waitForTransactionReceipt } from "viem/actions";
import { useTokenStore } from "../store/tokenStore";
// 新增 ERC20 代币生成入口组件，支持手动输入名称和数量
const CreateTokenEntry: React.FC = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenAmount, setTokenAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // 新增加载状态
  const reloadFromFactory = useTokenStore((s) => s.reloadFromFactory);
  // 1. 使用 useAccount 获取连接状态
  const { address, isConnected, isDisconnected } = useAccount();
  const publicClient = usePublicClient();
  const { openConnectModal } = useConnectModal();
  const { writeContract, writeContractAsync } = useWriteContract();
  // 新增：使用 useDisconnect hook 实现断开连接功能
  const { disconnect } = useDisconnect();
  //监听事件
  useWatchContractEvent({
    address: contract_address.TOKEN_FACTORY as `0x${string}`,
    abi: TokenFactoryAbi,
    eventName: "TokenCreated",
    onLogs(logs) {
      setIsLoading(false); // 结束加载
      console.log("Token created and minted");
      console.log("Token 创建并铸币成功！");
      console.log("监听到 TokenCreated 事件，代币创建成功！", logs);
      if (publicClient) {
        reloadFromFactory(publicClient);
      }
    },
  });
  const {
    data: totalTokens,
    isError,
    error,
  } = useReadContract({
    address: contract_address.TOKEN_FACTORY as `0x${string}`,
    abi: TokenFactoryAbi,
    functionName: "getAllTokens",
    query: {
      enabled: !!address,
      retry: 3,
    },
  });

  // 添加详细的日志
  useEffect(() => {
    console.log("useReadContract状态:", {
      totalTokens,
      isError,
      error,
      address,
      contractAddress: contract_address.TOKEN_FACTORY,
    });
  }, [totalTokens, isError, error, address]);
  //模拟调用  用来判断是否能调用成功   如果不能执行成功提前帮用户避免Gas损失！！
  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: contract_address.TOKEN_FACTORY as `0x${string}`,
    abi: TokenFactoryAbi,
    functionName: "createToken",
    args: [tokenName, tokenSymbol, tokenAmount],
    query: {
      enabled: !!tokenName && !!tokenSymbol && !!tokenAmount && !!address,
    },
  });

  useEffect(() => {
    console.log("simulateError:", simulateError);
    console.log("simulateData:", simulateData);
  }, [simulateError, simulateData]);

  const generateToken = async () => {
    //先检查钱包链接情况
    if (isDisconnected) {
      alert("请先连接钱包！");
      return;
    }
    if (!tokenName || !tokenSymbol || !tokenAmount) {
      alert("请完整填写代币信息");
      return;
    }
    setIsLoading(true); // 开始加载

    console.log("simulateData:", simulateData);
    console.log("simulateError:", simulateError);
    if (!simulateData) {
      setIsLoading(false); // 结束加载
      alert("代币生成失败，请检查输入信息");
      return;
    }
    await writeContractMethod();
  };

  //写入合约
  const writeContractMethod = async () => {
    if (!publicClient) {
      console.error("PublicClient 未初始化");
      return;
    }

    const tx = await writeContractAsync({
      address: contract_address.TOKEN_FACTORY as `0x${string}`,
      abi: TokenFactoryAbi,
      functionName: "createToken",
      args: [tokenName, tokenSymbol, tokenAmount],
    });
    const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
    console.log("receiptA:", receipt);
    if (receipt?.status !== "success") {
      console.error("A mint失败");
      return;
    }
    console.log("A mint成功");
  };
  return (
    <div className="space-y-4">
      <h3 className="text-lg md:text-xl font-semibold mb-2">测试网生成 ERC20 代币</h3>
      <div className="grid gap-2">
        <input type="text" placeholder="代币名称" value={tokenName} onChange={(e) => setTokenName(e.target.value)} className="input-neon" />
        <input
          type="text"
          placeholder="代币符号"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          className="input-neon"
        />
        <input
          type="number"
          placeholder="初始发行数量"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(Number(e.target.value))}
          className="input-neon"
        />
      </div>
      {address && isConnected ? (
        <div className="flex gap-3">
          <button className="btn-neon flex-1" onClick={generateToken}>
            {isLoading ? "加载中..." : "生成 ERC20 代币"}
          </button>
          <button
            className="flex-1 rounded-lg px-4 py-3 font-semibold border border-red-400/40 text-red-300 hover:bg-red-500/10 transition"
            onClick={() => disconnect()}
          >
            断开连接
          </button>
        </div>
      ) : (
        <button className="btn-neon w-full" onClick={openConnectModal}>
          连接钱包
        </button>
      )}
    </div>
  );
};
export default CreateTokenEntry;
