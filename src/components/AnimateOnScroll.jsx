import { useScrollAnimation } from "../hooks/useScrollAnimation";
import "../styles/animations.css";

export default function AnimateOnScroll({
  children,
  animation = "slide-up",
  delay = 0,
  className = "",
  style = {},
}) {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`${animation} ${isVisible ? "visible" : ""} ${delay ? `delay-${delay}` : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
