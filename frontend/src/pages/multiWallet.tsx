import React, { useState } from "react";
import { useConnect } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "@wagmi/connectors";
import { Modal, Button, List, Avatar, Spin, message } from "antd";
import { WalletOutlined, LoadingOutlined } from "@ant-design/icons";

type WalletOption = {
  id: string;
  name: string;
  iconUrl: string;
  createConnector: () => any;
};

// 定义钱包列表
const wallets: WalletOption[] = [
  {
    id: "metaMask",
    name: "MetaMask",
    iconUrl: "/icons/metamask.png",
    createConnector: () =>
      injected({
        shimDisconnect: true,
      }),
  },
  {
    id: "walletConnect",
    name: "WalletConnect",
    iconUrl: "/icons/walletconnect.png",
    createConnector: () =>
      walletConnect({
        projectId: "your-project-id", // 需要替换为实际的 WalletConnect 项目 ID
      }),
  },
  {
    id: "coinbaseWallet",
    name: "Coinbase Wallet",
    iconUrl: "/icons/coinbase.png",
    createConnector: () =>
      coinbaseWallet({
        appName: "MyApp",
      }),
  },
];

export default function WalletModal() {
  const { connectAsync } = useConnect();
  const [loadingWallet, setLoadingWallet] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const handleConnect = async (wallet: WalletOption) => {
    try {
      setLoadingWallet(wallet.id);
      const connector = wallet.createConnector();
      await connectAsync({ connector });
      message.success(`成功连接到 ${wallet.name}`);
      setVisible(false);
    } catch (err: any) {
      console.error(`❌ Failed to connect:`, err);
      message.error(`连接失败: ${err.message || "未知错误"}`);
    } finally {
      setLoadingWallet(null);
    }
  };

  return (
    <>
      <Button type="primary" icon={<WalletOutlined />} onClick={() => setVisible(true)} size="large" className="mb-4">
        连接钱包
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <WalletOutlined />
            选择钱包
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={400}
        centered
      >
        <List
          dataSource={wallets}
          renderItem={(wallet) => (
            <List.Item>
              <Button
                type="text"
                block
                size="large"
                className="h-16 flex items-center justify-start"
                onClick={() => handleConnect(wallet)}
                disabled={loadingWallet === wallet.id}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar src={wallet.iconUrl} size={32} icon={<WalletOutlined />} />
                  <span className="text-left flex-1">{wallet.name}</span>
                  {loadingWallet === wallet.id && <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />}
                </div>
              </Button>
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
}
