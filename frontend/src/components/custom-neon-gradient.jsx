import { NeonGradientCard } from "./magicui/neon-gradient-card";

export function CustomNeonGradientCard({ className, children, ...props }) {
  return (
    <NeonGradientCard
      className={className}
      {...props}
    >
      <div className="-m-[1.7rem] -mb-[1.6rem]">
        {children}
      </div>
    </NeonGradientCard>
  );
}