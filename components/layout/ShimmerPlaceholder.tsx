// components/ShimmerPlaceholder.tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * A reusable shimmer placeholder component using react-native-shimmer-placeholder
 *
 * Usage:
 * <ShimmerPlaceholder width={200} height={20} borderRadius={8} />
 * <ShimmerPlaceholder.Circle size={60} />
 * <ShimmerPlaceholder visible={isLoaded} width={300} height={100} />
 */

interface ShimmerPlaceholderProps extends ViewProps {
  /** Width of the placeholder (required if not using Circle) */
  width?: number ;
  /** Height of the placeholder */
  height?: number ;
  /** Border radius */
  borderRadius?: number;
  /** Whether to show the content (when true, shimmer stops and children are shown) */
  visible?: boolean;
  /** Shimmer animation speed in ms (default: 1000) */
  duration?: number;
  /** Background color of shimmer (default light gray) */
  shimmerColors?: string[];
  /** Children to show when visible=true */
  children?: React.ReactNode;
}

export const ShimmerPlaceholderComponent: React.FC<ShimmerPlaceholderProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
  visible = false,
  duration = 1000,
  shimmerColors = ['#ebebeb', '#c5c5c5', '#ebebeb'],
  children,
  style,
  ...props
}) => {
  return (
    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      width={width}
      height={height}
    //   borderRadius={borderRadius}
      visible={visible}
    //   duration={duration}
    //   shimmerColors={shimmerColors}
      style={style}
      {...props}>
      {/* {visible && children ? children : <View />} */}
    </ShimmerPlaceholder>
  );
};

// Circle variant
interface CircleProps extends Omit<ShimmerPlaceholderProps, 'width' | 'height'> {
  size: number;
}

export const ShimmerCircle: React.FC<CircleProps> = ({
  size,
  visible = false,
  children,
  ...props
}) => {
  return (
    <ShimmerPlaceholder
      LinearGradient={LinearGradient}
      width={size}
      height={size}
      borderRadius={size / 2}
      visible={visible}
      style={{ borderRadius: size / 2 }}
      {...props}>
      {visible && children ? children : <View />}
    </ShimmerPlaceholder>
  );
};

// Example usage in your ProjectDetailScreen while loading
/*
{isLoading ? (
  <View className="mx-6 mt-6 space-y-5">
    <ShimmerPlaceholderComponent height={40} borderRadius={12} />
    <ShimmerPlaceholderComponent height={100} borderRadius={16} />
    <View className="flex-row items-center space-x-4">
      <ShimmerCircle size={56} />
      <View className="flex-1">
        <ShimmerPlaceholderComponent height={16} borderRadius={8} />
        <ShimmerPlaceholderComponent height={14} width="60%" borderRadius={8} className="mt-2" />
      </View>
    </View>
    {[...Array(4)].map((_, i) => (
      <ShimmerPlaceholderComponent key={i} height={60} borderRadius={16} />
    ))}
  </View>
) : (
  // Real content
)}
*/
