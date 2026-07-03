interface QuantityBadgeProps {
  quantity: number | null | undefined;
}

export function QuantityBadge({ quantity }: QuantityBadgeProps) {
  if (!quantity || quantity <= 1) {
    return null;
  }

  return <span className="quantity-badge">{quantity} ea</span>;
}
