import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Pressable,
    Text,
    TextInput,
    TextInputProps,
    View
} from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  error?: string;
  isRequired?: boolean;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  isRequired = false,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);

  // Container classes
  let containerClasses = 'mb-4';
  if (containerClassName) {
    containerClasses += ` ${containerClassName}`;
  }

  // Input container classes
  let inputContainerClasses = 'relative flex-row items-center border rounded-lg bg-white';
  if (hasError) {
    inputContainerClasses += ' border-error-500';
  } else if (isFocused) {
    inputContainerClasses += ' border-primary-500';
  } else {
    inputContainerClasses += ' border-gray-300';
  }

  // Input classes
  let inputClasses = 'flex-1 px-3 py-3 text-base text-gray-900 font-inter-regular';
  if (leftIcon) {
    inputClasses += ' pl-2';
  }
  if (secureTextEntry || rightIcon) {
    inputClasses += ' pr-10';
  }
  if (className) {
    inputClasses += ` ${className}`;
  }

  return (
    <View className={containerClasses}>
      {/* Label */}
      {label && (
        <Text className="text-sm text-gray-700 font-inter-medium mb-2">
          {label}
          {isRequired && <Text className="text-error-500"> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View className={inputContainerClasses}>
        {/* Left Icon */}
        {leftIcon && (
          <View className="pl-3">
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          className={inputClasses}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
          {...props}
        />

        {/* Password Toggle */}
        {secureTextEntry && (
          <Pressable
            className="absolute right-3 p-1"
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Ionicons name="eye-off" size={20} color="#9CA3AF" />
            ) : (
              <Ionicons name="eye" size={20} color="#9CA3AF" />
            )}
          </Pressable>
        )}

        {/* Right Icon */}
        {rightIcon && !secureTextEntry && (
          <View className="pr-3">
            {rightIcon}
          </View>
        )}
      </View>

      {/* Error Message */}
      {hasError && (
        <Text className="text-sm text-error-500 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;