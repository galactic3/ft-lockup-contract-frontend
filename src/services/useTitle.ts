import { useEffect } from 'react';

export interface UseTitleOptions {
  restoreOnUnmount?: boolean;
}

const DEFAULT_USE_TITLE_OPTIONS: UseTitleOptions = {
  restoreOnUnmount: false,
};

function useTitle(title: string, options: UseTitleOptions = DEFAULT_USE_TITLE_OPTIONS) {
  useEffect(() => {
    const prevTitle = document.title;
    if (document.title !== title) document.title = title;

    // eslint: disable
    if (options && options.restoreOnUnmount) {
      return () => {
        document.title = prevTitle;
      };
    }

    return () => {};
  });
}

export default typeof document !== 'undefined' ? useTitle : () => {};
