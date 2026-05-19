import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { StyleSheet, View } from "react-native";

// ── Single blog card skeleton ─────────────────────────────────────────────────

function BlogCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 300, delay: index * 100 }}
      style={styles.card}
    >
      {/* Thumbnail */}
      <Skeleton colorMode="light" width="100%" height={192} radius={0} />

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Skeleton colorMode="light" width="90%" height={18} radius={4} />
        <View style={{ height: 8 }} />
        <Skeleton colorMode="light" width="75%" height={18} radius={4} />
        <View style={{ height: 12 }} />

        {/* Description lines */}
        <Skeleton colorMode="light" width="100%" height={13} radius={4} />
        <View style={{ height: 6 }} />
        <Skeleton colorMode="light" width="100%" height={13} radius={4} />
        <View style={{ height: 6 }} />
        <Skeleton colorMode="light" width="60%" height={13} radius={4} />
        <View style={{ height: 14 }} />

        {/* Read more */}
        <Skeleton colorMode="light" width={100} height={14} radius={4} />
      </View>
    </MotiView>
  );
}

// ── Full skeleton list ────────────────────────────────────────────────────────

const BlogSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} index={i} />
      ))}
    </>
  );
};

export default BlogSkeleton;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
});
