import { create } from "zustand";
import type { PublicClient } from "viem";
import ERC20Abi from "../abi/ERC20.json";
import TokenFactoryAbi from "../abi/TokenFactory.json";
import { contract_address } from "../constants";

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface TokenStoreState {
  tokens: Token[];
  setTokens: (tokens: Token[]) => void;
  addTokenIfMissing: (t: Token) => void;
  reloadFromFactory: (client: PublicClient) => Promise<void>;
}

export const useTokenStore = create<TokenStoreState>((set, get) => ({
  tokens: [],
  setTokens: (tokens) => set({ tokens }),
  addTokenIfMissing: (t) => {
    const exists = get().tokens.some((x) => x.address.toLowerCase() === t.address.toLowerCase());
    if (!exists) set({ tokens: [...get().tokens, t] });
  },
  reloadFromFactory: async (client: PublicClient) => {
    if (!contract_address?.TOKEN_FACTORY) {
      console.log("TOKEN_FACTORY 地址未配置，跳过加载");
      return;
    }

    if (!client) {
      console.log("PublicClient 未初始化，跳过加载");
      return;
    }

    try {
      console.log("开始从合约加载代币列表:", contract_address.TOKEN_FACTORY);

      // 先检查合约是否存在
      const code = await client.getCode({ address: contract_address.TOKEN_FACTORY as `0x${string}` });
      if (code === "0x") {
        console.log("合约地址没有代码，可能未部署:", contract_address.TOKEN_FACTORY);
        return;
      }

      //获取合约地址
      //拿到所有的  ERC20 代币地址
      //通过erc20 Abi   查询  name/symbol/decimals！！！
      const addresses = (await client.readContract({
        address: contract_address.TOKEN_FACTORY as `0x${string}`,
        abi: TokenFactoryAbi,
        functionName: "getAllTokens",
        args: [],
      })) as `0x${string}`[];
      console.log("成功获取代币地址列表:", addresses);
      // 并发读取 name/symbol/decimals（优先用 tokenInfos 的 name/symbol，如果合约暴露了）
      const tokens = await Promise.all(
        addresses.map(async (addr) => {
          try {
            // 先尝试从 tokenInfos 读取 name/symbol
            let name: string | undefined;
            let symbol: string | undefined;
            try {
              const info = (await client.readContract({
                address: contract_address.TOKEN_FACTORY as `0x${string}`,
                abi: TokenFactoryAbi,
                functionName: "tokenInfos",
                args: [addr],
              })) as any;
              name = info?.[0];
              symbol = info?.[1];
            } catch {}

            // ERC20 标准信息
            const [erc20Name, erc20Symbol, decimals] = await Promise.all([
              name
                ? Promise.resolve(name)
                : (client.readContract({ address: addr, abi: ERC20Abi, functionName: "name" }) as Promise<string>),
              symbol
                ? Promise.resolve(symbol)
                : (client.readContract({ address: addr, abi: ERC20Abi, functionName: "symbol" }) as Promise<string>),
              client.readContract({ address: addr, abi: ERC20Abi, functionName: "decimals" }) as Promise<number>,
            ]);
            console.log("erc20Name:", erc20Name);
            console.log("erc20Symbol:", erc20Symbol);
            console.log("decimals:", decimals);
            return {
              address: addr,
              name: erc20Name,
              symbol: erc20Symbol,
              decimals,
            } as Token;
          } catch {
            // 兜底：无法读到时至少返回地址
            return { address: addr, name: "Unknown", symbol: "UNK", decimals: 18 } as Token;
          }
        })
      );

      // 去重（防多次事件/网络抖动）
      const uniq = Array.from(new Map(tokens.map((t) => [t.address.toLowerCase(), t])).values());
      set({ tokens: uniq });
      console.log("代币列表加载完成，共", uniq.length, "个代币");
    } catch (error) {
      console.error("加载代币列表失败:", error);
      // 如果获取失败，设置为空数组而不是抛出错误
      set({ tokens: [] });
    }
  },
}));
