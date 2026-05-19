import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { StyleSheet } from "react-native";

const HeaderSkeleton = () => {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.header}
    >
      {/* Logo */}
      <Skeleton colorMode="light" width={151} height={42} radius={8} />

      {/* Search button circle */}
      <Skeleton colorMode="light" width={48} height={48} radius="round" />
    </MotiView>
  );
};

export default HeaderSkeleton;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
});
