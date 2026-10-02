type AuthEventListener = () => void;

class AuthEventEmitter {
  private unauthenticatedListeners: Set<AuthEventListener> = new Set();
  private sessionRefreshedListeners: Set<AuthEventListener> = new Set();

  public onUnauthenticated(listener: AuthEventListener): () => void {
    this.unauthenticatedListeners.add(listener);
    return () => {
      this.unauthenticatedListeners.delete(listener);
    };
  }

  public onSessionRefreshed(listener: AuthEventListener): () => void {
    this.sessionRefreshedListeners.add(listener);
    return () => {
      this.sessionRefreshedListeners.delete(listener);
    };
  }

  public emitUnauthenticated(): void {
    this.unauthenticatedListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in unauthenticated listener:", error);
      }
    });
  }

  public emitSessionRefreshed(): void {
    this.sessionRefreshedListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in sessionRefreshed listener:", error);
      }
    });
  }
}

export const authEvents = new AuthEventEmitter();
