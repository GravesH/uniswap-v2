import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract, useSimulateContract, usePublicClient } from "wagmi";
import TokenFactoryAbi from "../abi/TokenFactory.json";
import { contract_address } from "../pages/constants";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { waitForTransactionReceipt } from "viem/actions";

import { boolean, is } from "@metamask/superstruct";
// 新增 ERC20 代币生成入口组件，支持手动输入名称和数量
const CreateTokenEntry: React.FC = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenAmount, setTokenAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // 新增加载状态
  // 1. 使用 useAccount 获取连接状态
  const { address, isConnected, isDisconnected } = useAccount();
  const publicClient = usePublicClient();
  const { openConnectModal } = useConnectModal();

  const { writeContract, writeContractAsync } = useWriteContract();
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
    const tx = await writeContractAsync({
      address: contract_address.TOKEN_FACTORY as `0x${string}`,
      abi: TokenFactoryAbi,
      functionName: "createToken",
      args: [tokenName, tokenSymbol, tokenAmount],
    });
    const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
    console.log("receiptA:", receipt);
    if (receipt?.status !== "success") {
      console.error("A 授权失败");
      return;
    }
    console.log("A 授权成功");
  };
  return (
    <div
      style={{
        marginBottom: 32,
        padding: 16,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h3>测试网生成 ERC20 代币</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          placeholder="代币名称"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="代币符号"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="number"
          placeholder="初始发行数量"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(Number(e.target.value))}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
      </div>
      {address && isConnected ? (
        <button style={{ width: "100%" }} onClick={generateToken}>
          {isLoading ? "加载中..." : "生成 ERC20 代币"}
        </button>
      ) : (
        <button style={{ width: "100%", marginTop: 8 }} onClick={openConnectModal}>
          连接钱包
        </button>
      )}
    </div>
  );
};
export default CreateTokenEntry;
