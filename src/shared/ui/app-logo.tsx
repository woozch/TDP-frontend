import Image from "next/image";
import logoLight from "../assets/images/logo-light.png";
import logoDark from "../assets/images/logo-dark.png";

interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 24, className = "" }: AppLogoProps) {
  const width = Math.round((logoLight.width / logoLight.height) * size);

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-md bg-transparent p-px dark:bg-transparent ${className}`}
      style={{ width, height: size }}
      aria-hidden
    >
      {/* Light mode logo */}
      <Image
        src={logoLight}
        alt="TDP logo"
        className="h-full w-full object-contain dark:hidden"
        priority
      />
      {/* Dark mode logo */}
      <Image
        src={logoDark}
        alt="TDP logo"
        className="hidden h-full w-full object-contain dark:block"
        priority
      />
    </span>
  );
}
