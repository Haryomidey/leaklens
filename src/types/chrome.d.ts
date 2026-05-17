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
  tabs: {
    query(queryInfo: {active?: boolean; currentWindow?: boolean}): Promise<Array<{id?: number; url?: string}>>;
    sendMessage(tabId: number, message: {action: string; [key: string]: unknown}): Promise<any>;
  };
};