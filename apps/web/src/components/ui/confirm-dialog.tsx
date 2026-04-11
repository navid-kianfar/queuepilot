import { createContext, useContext, useState, useCallback } from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  const icons = {
    danger: <Trash2 className="h-5 w-5 text-destructive" />,
    warning: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const confirmColors = {
    danger: 'bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive/20',
    warning: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500/20',
    info: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring/20',
  };

  const iconBgs = {
    danger: 'bg-destructive/10',
    warning: 'bg-orange-500/10',
    info: 'bg-blue-500/10',
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialogPrimitive.Root open={!!state} onOpenChange={(open) => { if (!open) handleCancel(); }}>
        <AlertDialogPrimitive.Portal>
          <AlertDialogPrimitive.Overlay
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          />
          <AlertDialogPrimitive.Content
            className="fixed left-1/2 top-1/2 z-[100] w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200"
          >
            <div className="p-6">
              {state && (
                <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl', iconBgs[state.variant || 'danger'])}>
                  {icons[state.variant || 'danger']}
                </div>
              )}
              <AlertDialogPrimitive.Title className="text-base font-semibold text-foreground">
                {state?.title}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {state?.description}
              </AlertDialogPrimitive.Description>
            </div>
            <div className="flex items-center gap-3 border-t border-border px-6 py-4">
              <AlertDialogPrimitive.Cancel
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {state?.cancelText || 'Cancel'}
              </AlertDialogPrimitive.Cancel>
              <AlertDialogPrimitive.Action
                onClick={handleConfirm}
                className={cn(
                  'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2',
                  state ? confirmColors[state.variant || 'danger'] : '',
                )}
              >
                {state?.confirmText || 'Confirm'}
              </AlertDialogPrimitive.Action>
            </div>
          </AlertDialogPrimitive.Content>
        </AlertDialogPrimitive.Portal>
      </AlertDialogPrimitive.Root>
    </ConfirmContext.Provider>
  );
}
