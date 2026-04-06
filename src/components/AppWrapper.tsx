import { LayoutProvider } from "@/context/useLayoutContext";
import { NotificationProvider } from "@/context/useNotificationContext";
import type { ChildrenType } from "@/types";
import { AuthProvider } from "@/context/AuthProvider";
import Loading from "@/context/Loader";
const AppWrapper = ({ children }: ChildrenType) => {
  return (
    <LayoutProvider>
      <AuthProvider>
        <Loading>
          <NotificationProvider>{children}</NotificationProvider>
        </Loading>
      </AuthProvider>
    </LayoutProvider>
  );
};

export default AppWrapper;
