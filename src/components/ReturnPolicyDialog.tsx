"use client";

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReturnPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReturnPolicyDialog({ open, onOpenChange }: ReturnPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Return and Refund Policy</DialogTitle>
          <DialogDescription>
            Please read our return policy carefully before placing your order
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-4">
                We set these policies to ensure that you are fully aware of our refund and return methods and procedures. These policies are applicable to INDIA.
              </p>
              <p className="text-muted-foreground">
                Thank you for choosing to shop at Sd-Jewels. We want to ensure your complete satisfaction with your purchase.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Damaged Product</h3>
              <p className="text-muted-foreground">
                If you receive a damaged product, kindly provide us with an unboxing video showing the damage. This evidence is crucial for us to assess the situation and provide appropriate assistance.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Missing Items</h3>
              <p className="text-muted-foreground">
                Should any items be absent from your order, please share an unboxing video displaying the remaining items. Kindly inform us within 48 hours of delivery. We will examine the situation and, if confirmed, issue a refund for the missing item(s).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Exchange for Wrong Product</h3>
              <p className="text-muted-foreground">
                If you mistakenly ordered the wrong product and would like to exchange it, please note that the shipping charges for returning the item and for the replacement item will be your responsibility, since we are a wholesale website and not a retail website.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Custom-Printed Products Policy</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Order Cancellation:</strong> Once a customer places an order for a printed product, it cannot be canceled due to production costs.</p>
                <p><strong>Undeliverable Shipments:</strong> If a shipment cannot be delivered, we will arrange for an alternative courier service, but the product will not be taken back.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Delayed Deliveries by Courier</h3>
              <p className="text-muted-foreground">
                If delivery occurs beyond the standard time frame (e.g., 1–2 months due to courier delays), we will work with the courier service on a case-by-case basis. Please track your order regularly and contact us if there are no updates within 15 days of dispatch.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Refund Eligibility</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Damaged or Defective Products:</strong> Upon confirmation through provided video, we will proceed with the refund.</p>
                <p><strong>Missing Items:</strong> If we cannot provide missing items, a refund will be issued.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Original Condition and Packaging</h3>
              <p className="text-muted-foreground">
                To qualify for a refund or exchange, returned products must be in their original condition, unused, unwashed, and undamaged. All original packaging, including accessories, tags, and labels, should be included.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Rejection / Denial of Parcel Policy</h3>
              <p className="text-muted-foreground mb-2">
                If a customer rejects or denies accepting the parcel after dispatch, the following deductions will apply:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Shipping Charge: 2 times the original shipping charge (includes forward and reverse shipping)</li>
                <li>Packing Charge: 10% of the product value</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2">Refund Process</h3>
              <p className="text-muted-foreground mb-2">
                Once your return is received and inspected, we will notify you. If approved, the refund will be processed within 7 days.
              </p>
              <p className="text-muted-foreground mb-2">The return will be processed only if:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>The product was not damaged while in your possession</li>
                <li>The product is not different from what was shipped</li>
                <li>The product is returned in its original condition</li>
                <li>Customer provides an unboxing video</li>
                <li>Product is unused, undamaged, with original packaging, receipt, and invoice</li>
              </ul>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-base mb-2">Contact Information</h3>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>Address:</strong> SD-Jewels, 89th Thandupathai Street, Annasagaram, Dharmapuri, Tamil Nadu – 636704</p>
                  <p><strong>Support Contact:</strong> 9363475021</p>
                <p><strong>Support Hours:</strong> Monday to Friday, 9:00 AM to 7:00 PM</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
