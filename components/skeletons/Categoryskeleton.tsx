import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { StyleSheet, View } from "react-native";

const PILL_WIDTHS = [48, 120, 110, 90, 100];

const CategorySkeleton = () => {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.row}
    >
      {PILL_WIDTHS.map((width, i) => (
        <View key={i} style={styles.pillWrapper}>
          <Skeleton colorMode="light" width={width} height={36} radius={12} />
        </View>
      ))}
    </MotiView>
  );
};

export default CategorySkeleton;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  pillWrapper: {
    marginRight: 4,
  },
});
