const FloatingText = ({ x, y, text, onAnimationEnd }) => (
  <div
    className="floating-text"
    style={{
      left: `${x}px`,
      top: `${y}px`,
    }}
    onAnimationEnd={onAnimationEnd}
  >
    {text}
  </div>
);

export default FloatingText;
