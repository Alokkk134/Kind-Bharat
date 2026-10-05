"use client";

import { createContext, useContext, useTransition } from "react";

const PendingContext = createContext<boolean | null>(null);

/** True while the surrounding ActionForm is submitting (null outside one). */
export function useActionFormPending() {
  return useContext(PendingContext);
}

/**
 * Form that calls a useActionState dispatcher without React's automatic form reset,
 * so typed values stay when the server returns validation errors.
 * Includes the clicked submit button's name/value (for multi-button forms).
 */
export function ActionForm({
  action,
  children,
  onBeforeSubmit,
  ref,
  ...props
}: Omit<React.FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit"> & {
  action: (formData: FormData) => void;
  /** Return false to cancel (e.g. a confirm dialog). */
  onBeforeSubmit?: (submitter: HTMLElement | null) => boolean;
  ref?: React.Ref<HTMLFormElement>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <PendingContext.Provider value={pending}>
      <form
        {...props}
        ref={ref}
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
          if (onBeforeSubmit && !onBeforeSubmit(submitter)) return;
          const fd = new FormData(e.currentTarget, submitter);
          startTransition(() => action(fd));
        }}
      >
        {children}
      </form>
    </PendingContext.Provider>
  );
}
