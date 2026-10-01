import { create } from "zustand";

type BookingDialogState = {
  open: boolean;
  preselectedServiceId: string | null;
  /** Open the booking wizard. Pass a serviceId to preselect a service. */
  openDialog: (serviceId?: string | null) => void;
  closeDialog: () => void;
};

export const useBookingDialog = create<BookingDialogState>((set) => ({
  open: false,
  preselectedServiceId: null,
  openDialog: (serviceId = null) =>
    set({ open: true, preselectedServiceId: serviceId }),
  closeDialog: () =>
    set((s) => ({ open: false, preselectedServiceId: s.preselectedServiceId })),
}));
