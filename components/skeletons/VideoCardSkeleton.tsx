import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { StyleSheet, View } from "react-native";

const VideoCardSkeleton = ({ index = 0 }: { index?: number }) => {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 300, delay: index * 100 }}
      style={styles.card}
    >
      {/* Thumbnail */}
      <Skeleton colorMode="light" width="100%" height={210} radius={0} />

      {/* Info row */}
      <View style={styles.infoRow}>
        {/* Avatar circle */}
        <Skeleton colorMode="light" width={40} height={40} radius="round" />

        {/* Text lines */}
        <View style={styles.textBlock}>
          <Skeleton colorMode="light" width="88%" height={13} radius={4} />
          <View style={{ height: 6 }} />
          <Skeleton colorMode="light" width="65%" height={13} radius={4} />
          <View style={{ height: 8 }} />
          <Skeleton colorMode="light" width="44%" height={11} radius={4} />
        </View>
      </View>
    </MotiView>
  );
};

export default VideoCardSkeleton;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  textBlock: {
    flex: 1,
    paddingTop: 2,
  },
});
