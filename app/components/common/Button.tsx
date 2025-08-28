import React from "react";
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    Text,
    View,
} from "react-native";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  title: string;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = "solid",
  size = "md",
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const disabled = isDisabled || isLoading;

  // Base styles
  let buttonClasses = "flex-row items-center justify-center rounded-lg border";
  let textClasses = "font-inter-medium";

  // Variant styles
  switch (variant) {
    case "solid":
      buttonClasses += disabled
        ? " bg-gray-300 border-gray-300"
        : " bg-primary-500 border-primary-500 active:bg-primary-600";
      textClasses += disabled ? " text-gray-500" : " text-white";
      break;
    case "outline":
      buttonClasses += disabled
        ? " bg-transparent border-gray-300"
        : " bg-transparent border-primary-500 active:bg-primary-50";
      textClasses += disabled ? " text-gray-400" : " text-primary-500";
      break;
    case "ghost":
      buttonClasses += disabled
        ? " bg-transparent border-transparent"
        : " bg-transparent border-transparent active:bg-primary-50";
      textClasses += disabled ? " text-gray-400" : " text-primary-500";
      break;
  }

  // Size styles
  switch (size) {
    case "sm":
      buttonClasses += " px-3 py-2 min-h-[36px]";
      textClasses += " text-sm";
      break;
    case "lg":
      buttonClasses += " px-6 py-4 min-h-[52px]";
      textClasses += " text-lg";
      break;
    default:
      buttonClasses += " px-4 py-3 min-h-[44px]";
      textClasses += " text-base";
      break;
  }

  // Full Width
  if (fullWidth) {
    buttonClasses += " w-full";
  }

  // Custom className
  if (className) {
    buttonClasses += ` ${className}`;
  }

  return (
    <Pressable className={buttonClasses} disabled={disabled} {...props}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "solid" ? "white" : "#3b82f6"}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon}
          <Text className={textClasses}>{title}</Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
};
