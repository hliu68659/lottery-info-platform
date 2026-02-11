import { Link } from "wouter";
import { LucideIcon } from "lucide-react";

interface FunctionItem {
  icon: LucideIcon;
  label: string;
  path: string;
  bgColor: string;
}

interface FunctionNavProps {
  items: FunctionItem[];
}

export function FunctionNav({ items }: FunctionNavProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link key={index} href={item.path}>
            <div className="h-full cursor-pointer transform transition-transform hover:scale-105">
              <div 
                className="flex flex-col items-center justify-center py-8 rounded-lg"
                style={{ 
                  borderColor: "rgba(0, 255, 0, 0.3)",
                  borderStyle: "dashed",
                  borderWidth: "3px"
                }}
              >
                <div 
                  className={`${item.bgColor} rounded-full p-6 mb-4 flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-bold text-center text-white drop-shadow-md">{item.label}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
