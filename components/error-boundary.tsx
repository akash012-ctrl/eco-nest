import React, { Component, ErrorInfo, ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error("Error Boundary caught an error:", error);
    console.error("Error Info:", errorInfo);

    // TODO: In production, send error to logging service
    // Example: logErrorToService(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <ThemedText style={styles.title}>
              Uh oh — something went wrong
            </ThemedText>
            <ThemedText style={styles.message}>
              {this.state.error.message || "An unexpected error occurred"}
            </ThemedText>
            {__DEV__ && (
              <ThemedText style={styles.stack}>
                {this.state.error.stack}
              </ThemedText>
            )}
            <ThemedText style={styles.retry} onPress={this.resetError}>
              Try again
            </ThemedText>
          </View>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.8,
  },
  stack: {
    fontSize: 12,
    marginBottom: 24,
    textAlign: "left",
    opacity: 0.6,
    fontFamily: Platform.select({
      ios: "Courier",
      android: "monospace",
      default: "monospace",
    }),
  },
  retry: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});
