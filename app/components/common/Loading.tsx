import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'large',
  overlay = false,
  className,
}) => {
  const content = (
    <View className="items-center justify-center space-y-4">
      <ActivityIndicator size={size} color="#3b82f6" />
      {message && (
        <Text className="text-base text-gray-600 text-center font-inter-regular">
          {message}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View className={`absolute inset-0 bg-white/90 items-center justify-center z-50 ${className || ''}`}>
        {content}
      </View>
    );
  }

  return (
    <View className={`flex-1 items-center justify-center ${className || ''}`}>
      {content}
    </View>
  );
};

export default Loading;