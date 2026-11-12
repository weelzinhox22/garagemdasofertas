import { Car, Cpu, House, Monitor, Package, Tags, Watch, Wrench } from "lucide-react";

const icons = { wrench: Wrench, cpu: Cpu, house: House, car: Car, watch: Watch, monitor: Monitor, package: Package, tags: Tags };
export function CategoryIcon({ name, size = 23 }: { name: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons] || Tags;
  return <Icon size={size} aria-hidden="true"/>;
}
