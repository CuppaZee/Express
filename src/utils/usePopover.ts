import { BaseSyntheticEvent, useState } from "react";

export default function usePopover() {
  const [state, set] = useState<{ isOpen: boolean; event?: Event }>({
    isOpen: false,
    event: undefined,
  });
  return [
    {
      isOpen: state.isOpen,
      event: state.event,
      onDidDismiss: () => set({ isOpen: false, event: undefined }),
    },
    (event: Event | BaseSyntheticEvent<Event>) => set({ isOpen: true, event: "nativeEvent" in event ? event.nativeEvent : event }),
  ] as const;
}
