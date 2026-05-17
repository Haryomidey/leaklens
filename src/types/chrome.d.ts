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
    query(queryInfo: {active?: boolean; currentWindow?: boolean}): Promise<Array<{id?: number; title?: string; url?: string}>>;
    sendMessage(tabId: number, message: {action: string; [key: string]: unknown}): Promise<any>;
  };
  scripting: {
    executeScript(details: {target: {tabId: number}; files: string[]}): Promise<unknown[]>;
  };
  storage: {
    local: {
      get<T extends Record<string, unknown>>(keys?: string[] | string | null): Promise<T>;
      set(items: Record<string, unknown>): Promise<void>;
    };
  };
};
