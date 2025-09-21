import { ethers } from "ethers";
import { useState } from "react";

export default function EIP712Demo() {
  const [signature, setSignature] = useState<string>("");

  async function signMessage() {
    if (!window.ethereum) {
      alert("请安装 MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // EIP-712 Domain
    //指定签名domian信息，防止签名被复用  比如指定了chainId，那么这个签名只能在当前chainId下使用
    const domain = {
      name: "MyDApp",
      version: "1",
      chainId: 137, //当前chainId
      verifyingContract: "0x1234567890123456789012345678901234567890", //签名只能被这个合约地址验证
    };

    // EIP-712 类型定义
    const types = {
      Person: [
        { name: "wallet", type: "address" },
        { name: "contents", type: "string" },
      ],
    };

    // 要签名的实际数据
    const message = {
      wallet: address,
      contents: "Hello EIP-712!",
    };

    // 使用 ethers.js 的签名
    const signature = await signer.signTypedData(domain, types, message);
    setSignature(signature);
    console.log("签名结果:", signature);
  }

  return (
    <div className="p-4">
      <button onClick={signMessage} className="px-4 py-2 bg-blue-500 text-white rounded">
        点击签名
      </button>
      {signature && <p className="mt-2 break-all">签名结果: {signature}</p>}
    </div>
  );
}
