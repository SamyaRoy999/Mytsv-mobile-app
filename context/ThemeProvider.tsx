import { View } from "react-native";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const path = usePathname();

  // Auth screens condition
  const isAuthPage = path.startsWith("/auth");

  return (
    <View
      style={{
        flex: 1,
        paddingTop: isAuthPage ? 0 : insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#f6f6f6",
      }}
    >
      {children}
    </View>
  );
};

export default ThemeProvider;
