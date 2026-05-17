declare const chrome: {
  runtime: {
    onInstalled: {
      addListener(callback: () => void): void;
    };
    onMessage: {
      addListener(
        callback: (
          request: {action?: string; [key: string]: unknown},
          sender: unknown,
          sendResponse: (response?: unknown) => void,
        ) => void,
      ): void;
    };
  };
};
