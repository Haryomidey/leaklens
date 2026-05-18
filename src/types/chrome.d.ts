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
        ) => boolean | void,
      ): void;
    };
    sendMessage(message: {action: string; [key: string]: unknown}): Promise<any>;
  };
  tabs: {
    query(queryInfo: {active?: boolean; currentWindow?: boolean}): Promise<Array<{id?: number; title?: string; url?: string}>>;
    sendMessage(tabId: number, message: {action: string; [key: string]: unknown}): Promise<any>;
  };
  scripting: {
    executeScript(details: {target: {tabId: number}; files: string[]}): Promise<unknown[]>;
  };
  downloads: {
    download(options: {url: string; filename?: string; saveAs?: boolean}): Promise<number>;
  };
  cookies: {
    getAll(details: {url?: string; domain?: string}): Promise<Array<{
      domain: string;
      expirationDate?: number;
      httpOnly: boolean;
      name: string;
      path: string;
      sameSite?: 'no_restriction' | 'lax' | 'strict' | 'unspecified';
      secure: boolean;
      session: boolean;
      value: string;
    }>>;
  };
  storage: {
    local: {
      get<T extends Record<string, unknown>>(keys?: string[] | string | null): Promise<T>;
      set(items: Record<string, unknown>): Promise<void>;
    };
  };
};
