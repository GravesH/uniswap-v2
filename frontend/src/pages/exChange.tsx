import React, { useEffect, useState } from "react";
import { Modal, Button, List } from "antd";
import { ethers } from "ethers";

const chains = [
  {
    chainId: 1,
    name: "Ethereum",
    rpc: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
  },
  {
    chainId: 137,
    name: "Polygon",
    rpc: "https://polygon-rpc.com",
  },
  {
    chainId: 56,
    name: "BNB Chain",
    rpc: "https://bsc-dataseed.binance.org/",
  },
];

const ChainSwitcherModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentChain, setCurrentChain] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);

  // 初始化 chain
  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      setCurrentChain(chainId);
      const chainInfo = chains.find((c) => c.chainId === chainId);
      if (chainInfo) {
        setProvider(new ethers.JsonRpcProvider(chainInfo.rpc));
      }
    };

    window.ethereum.on("chainChanged", handleChainChanged);

    // 初始化
    window.ethereum.request({ method: "eth_chainId" }).then((chainIdHex: string) => handleChainChanged(chainIdHex));

    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const switchChain = async (chainId: number) => {
    if (!window.ethereum) {
      alert("请安装 MetaMask");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + chainId.toString(16) }],
      });
      setVisible(false);
    } catch (error: any) {
      // 链不存在
      if (error.code === 4902) {
        const chainInfo = chains.find((c) => c.chainId === chainId);
        if (!chainInfo) return;
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x" + chainInfo.chainId.toString(16),
                chainName: chainInfo.name,
                rpcUrls: [chainInfo.rpc],
                nativeCurrency: {
                  name: chainInfo.name,
                  symbol: chainInfo.name.substring(0, 3),
                  decimals: 18,
                },
                blockExplorerUrls: [],
              },
            ],
          });
          setVisible(false);
        } catch (addError) {
          console.error("添加链失败", addError);
        }
      } else if (error.code === 4001) {
        console.log("用户拒绝切换链");
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>当前链ID: {currentChain}</h2>
      <Button type="primary" onClick={() => setVisible(true)}>
        切换链
      </Button>

      <Modal title="选择链" open={visible} onCancel={() => setVisible(false)} footer={null}>
        <List
          dataSource={chains}
          renderItem={(chain) => (
            <List.Item
              style={{
                cursor: "pointer",
                backgroundColor: currentChain === chain.chainId ? "#e6f7ff" : "white",
              }}
              onClick={() => switchChain(chain.chainId)}
            >
              {chain.name} {currentChain === chain.chainId ? "(当前)" : ""}
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default ChainSwitcherModal;
