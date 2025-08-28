import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightIcon,
  onRightPress,
  className,
}) => {
  const insets = useSafeAreaInsets();
  
  let headerClasses = 'bg-white border-b border-gray-200 px-4 pb-4';
  if (className) {
    headerClasses += ` ${className}`;
  }

  return (
    <View 
      className={headerClasses}
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="flex-row items-center justify-between h-11">
        {/* Left side */}
        <View className="w-12">
          {showBackButton && onBackPress && (
            <Pressable
              onPress={onBackPress}
              className="w-8 h-8 items-center justify-center rounded-full active:bg-gray-100"
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </Pressable>
          )}
        </View>

        {/* Center title */}
        <View className="flex-1 items-center">
          <Text className="text-lg text-gray-900 font-inter-semibold" numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right side */}
        <View className="w-12 items-end">
          {rightIcon && onRightPress && (
            <Pressable
              onPress={onRightPress}
              className="w-8 h-8 items-center justify-center rounded-full active:bg-gray-100"
            >
              {rightIcon}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

export default Header;