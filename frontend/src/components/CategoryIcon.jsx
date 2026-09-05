import React from "react";
import {
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  TrendingUp,
  Briefcase,
  Laptop,
  Building,
  Coins,
  Tag,
  CircleDollarSign,
  Wallet,
} from "lucide-react";
import { CATEGORIES } from "../utils/constants";

const ICON_MAP = {
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  TrendingUp,
  Briefcase,
  Laptop,
  Building,
  Coins,
  Tag,
  Wallet,
};

export default function CategoryIcon({ categoryName, size = 18, className = "" }) {
  const cat = CATEGORIES.find((c) => c.name.toLowerCase() === (categoryName || "").toLowerCase());
  const iconName = cat ? cat.icon : "Tag";
  const IconComponent = ICON_MAP[iconName] || CircleDollarSign;

  const color = cat ? cat.color : "#9ca3af";

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl p-2 shrink-0 ${className}`}
      style={{
        backgroundColor: `${color}1a`, // 10% opacity
        color: color,
        border: `1px solid ${color}33`,
      }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
}
