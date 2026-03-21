import { useEffect, useState } from "react";

export default function useCounter(target, speed = 20) {

  const [count, setCount] = useState(0);

  useEffect(() => {

    let current = 0;

    const interval = setInterval(() => {

      current += Math.ceil(target / 100);

      if (current >= target) {
        current = target;
        clearInterval(interval);
      }

      setCount(current);

    }, speed);

  }, [target]);

  return count;
}