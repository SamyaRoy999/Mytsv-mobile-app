import { usePathname } from "expo-router";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const HI = useSafeAreaInsets();
  const path = usePathname();

  // Auth screens condition
  const isAuthPage = path.startsWith("/auth");

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: isAuthPage ? 0 : HI.top,
        paddingBottom: HI.bottom,
        backgroundColor: "#f6f6f6",
      }}
    >
      {children}
    </SafeAreaView>
  );
};

export default ThemeProvider;
