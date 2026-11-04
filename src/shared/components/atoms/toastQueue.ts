import { create } from "zustand";

export type QueuedToast = {
  id: number;
  type: string;
  params: unknown;
  /** Goes ahead of the others waiting, e.g. a class about to start. */
  urgent: boolean;
};

type QueueState = {
  /** On screen, or animating out. */
  current: QueuedToast | null;
  waiting: QueuedToast[];
};

export const useToastQueue = create<QueueState>(() => ({
  current: null,
  waiting: [],
}));

/** How many toasts are waiting behind the one on screen. */
export const useWaitingCount = () =>
  useToastQueue((state) => state.waiting.length);

/** Lets the one on screen slide out before the next comes in. */
const HIDE_MS = 350;

/**
 * One toast at a time: `push` shows a toast now if nothing is up, otherwise
 * it waits its turn; `closed` brings on the next once the shown one hides.
 */
export function createToastQueue(display: (toast: QueuedToast) => void) {
  // The toast already on its way out, so a second hide doesn't skip one.
  let closing: number | null = null;

  const next = () => {
    const [upNext, ...rest] = useToastQueue.getState().waiting;
    closing = null;
    useToastQueue.setState({ current: upNext ?? null, waiting: rest });
    if (upNext) display(upNext);
  };

  return {
    push(toast: QueuedToast) {
      const { current, waiting } = useToastQueue.getState();
      if (!current) {
        useToastQueue.setState({ current: toast });
        display(toast);
        return;
      }
      // Urgent ones go after any urgent already waiting, ahead of the rest.
      const at = toast.urgent
        ? waiting.filter((queued) => queued.urgent).length
        : waiting.length;
      useToastQueue.setState({
        waiting: [...waiting.slice(0, at), toast, ...waiting.slice(at)],
      });
    },

    closed(id: number) {
      if (useToastQueue.getState().current?.id !== id || closing === id) return;
      closing = id;
      setTimeout(next, HIDE_MS);
    },
  };
}
