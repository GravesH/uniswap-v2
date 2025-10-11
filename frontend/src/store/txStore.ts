import { create } from "zustand";
import { waitForTransactionReceipt } from "viem/actions";
import { createJSONStorage, persist } from "zustand/middleware";
export type TxStatus = "pending" | "success" | "reverted";
export interface TxRecord {
  hash: string;
  status: TxStatus;
  type: string;
  chainId: number;
  account: string;
}

interface TxStoreState {
  transactions: TxRecord[];
  addTransaction: (tx: TxRecord) => void;
  updateTransaction: (hash: string, status: TxStatus) => void;
  clearTransactions: (hash: string) => void;
}
export const useTxStore = create<TxStoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransaction: (tx) => {
        const existing = get().transactions.find((t) => t.hash === tx.hash);
        if (existing) {
          set((state) => ({ transactions: state.transactions.map((t) => (t.hash === tx.hash ? { ...t, status: tx.status } : t)) }));
        } else {
          set((state) => ({ transactions: [...state.transactions, tx] }));
        }
      },
      updateTransaction: (hash, status) => {
        //更新交易状态
        const updatedTxs = get().transactions.map((tx) => (tx.hash === hash ? { ...tx, status } : tx));
        // ✅ 立即清除成功交易，避免 localStorage 残留
        const filteredTxs = status === "success" || status === "reverted" ? updatedTxs.filter((t) => t.hash !== hash) : updatedTxs;
        setTimeout(() => {
          set({ transactions: filteredTxs });
        }, 10000);
      },
      clearTransactions: (hash) => {
        //清除交易
        set((state) => ({ transactions: state.transactions.filter((tx) => tx.hash !== hash) }));
      },
    }),
    {
      name: "tx-storage",
    }
  )
);
