import { useEffect, useState } from "react";
import { ethers } from "ethers";

const Wallet = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    } else {
      alert("请安装 MetaMask 钱包");
    }
  }, []);

  // 事件绑定
  useEffect(() => {
    if (!window.ethereum) return;

    const eth = window.ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("accountsChanged", accounts);
      setAddress(accounts[0] || "");
      setIsConnected(accounts.length > 0);
    };

    const handleChainChanged = (chainIdHex: string) => {
      console.log("chainChanged", chainIdHex);
      setChainId(parseInt(chainIdHex, 16).toString());
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (!provider) return;
    const accounts = await provider.send("eth_requestAccounts", []);
    setAddress(accounts[0] || "");
    setIsConnected(accounts.length > 0);
    const network = await provider.getNetwork();
    setChainId(network.chainId.toString());
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress("");
    setChainId("");
  };

  return (
    <div>
      <button onClick={connectWallet}>
        {isConnected ? "已连接" : "连接钱包"}
      </button>
      {isConnected && <button onClick={disconnect}>断开连接</button>}
      <div>链ID：{chainId}</div>
      <div>当前账户：{address}</div>
    </div>
  );
};

export default Wallet;
