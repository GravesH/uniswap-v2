import { parseUnits, formatUnits } from "ethers";

/**
 * 计算 Uniswap V2 Swap 的预估结果 (ethers.js v6)
 * @param amountIn 输入代币数量 (bigint, 单位是最小单位, 比如 wei)
 * @param reserveIn 池子里输入代币的储备量 (bigint)
 * @param reserveOut 池子里输出代币的储备量 (bigint)
 * @returns { amountOut, feeAmount }
 */
export function getAmountOutWithFee(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint
) {
    if (amountIn <= BigInt(0)) throw new Error("amountIn 必须大于 0");
    if (reserveIn <= BigInt(0) || reserveOut <= BigInt(0))
        throw new Error("资金池储备必须大于 0");

    // 手续费 = 0.3% → 输入代币的 0.003 部分
    const feeAmount = (amountIn * BigInt(3)) / BigInt(1000);

    // 扣掉手续费后的有效输入
    const amountInWithFee = amountIn - feeAmount;
    console.log(formatUnits(amountInWithFee.toString(), 18), 'amountInWithFee');
    // 计算输出
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn + amountInWithFee;
    const amountOut = numerator / denominator;
    console.log(formatUnits(amountOut.toString(), 18), 'amountOut');
    return {
        amountOut, // 实际能拿到的数量 (bigint)
        feeAmount, // 扣掉的手续费 (bigint)
    };
}
