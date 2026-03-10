import Image from "next/image";
import logoImage from "../assets/images/logo.jpg";

interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 24, className = "" }: AppLogoProps) {
  const width = Math.round((logoImage.width / logoImage.height) * size);

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white p-px shadow-sm dark:border-[#4a515c] dark:bg-white ${className}`}
      style={{ width, height: size }}
      aria-hidden
    >
      <Image
        src={logoImage}
        alt="TDP logo"
        className="h-full w-full object-contain dark:brightness-110 dark:contrast-110"
        priority
      />
    </span>
  );
}

