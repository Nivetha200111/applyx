"use client";

import { LoaderCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface SubmitButtonProps extends ButtonProps {
  isPending?: boolean;
  pendingLabel: string;
}

export function SubmitButton({
  children,
  isPending = false,
  pendingLabel,
  ...props
}: SubmitButtonProps) {
  return (
    <Button aria-disabled={isPending} disabled={isPending} {...props}>
      {isPending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
