import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/** Stops one broken screen from blanking the whole site. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Screen crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className={styles.box} role="alert">
        <h1>Something went wrong</h1>
        <p>This page ran into a problem. Reloading usually fixes it.</p>
        <div className={styles.actions}>
          <button onClick={() => window.location.reload()}>Reload page</button>
          <a href="/">Go to the home page</a>
        </div>
      </div>
    );
  }
}
