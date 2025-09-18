import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  //   const handleClick = () => {
  //     setCount(count + 1); // 闭包捕获的 count
  //     setCount(count + 1); // 还是旧的 count
  //   };
  const handleClick = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1); // prev 会是第一次更新后的最新值
  };

  return (
    <div>
      <button onClick={handleClick}>{count}</button>;<div>66666</div>
      <div>77777</div>
    </div>
  );
}
export default Counter;
