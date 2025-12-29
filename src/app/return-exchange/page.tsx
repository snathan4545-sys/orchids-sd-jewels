import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Package, RefreshCw, Clock, Phone, MapPin, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Return & Exchange Policy',
  description: 'Learn about our return and exchange policy at SD-Jewels',
};

export default function ReturnExchangePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Return and Refund Policy</h1>
          <p className="text-lg text-muted-foreground">
            We set these policies to ensure that you are fully aware of our refund and return methods and procedures. These policies are applicable to INDIA.
          </p>
        </div>

        <Card className="p-8 mb-8">
          <p className="text-muted-foreground mb-4">
            Thank you for choosing to shop at Sd-Jewels. We want to ensure your complete satisfaction with your purchase. Please read our return policy carefully to understand the conditions and procedures for initiating a return.
          </p>
        </Card>

        <div className="space-y-8">
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Package className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Damaged Product</h2>
                <p className="text-muted-foreground">
                  If you receive a damaged product, kindly provide us with an unboxing video showing the damage. This evidence is crucial for us to assess the situation and provide appropriate assistance.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Missing Items</h2>
                <p className="text-muted-foreground">
                  Should any items be absent from your order, please share an unboxing video displaying the remaining items. Kindly inform us within 48 hours of delivery. We will examine the situation and, if confirmed, issue a refund for the missing item(s).
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <div className="flex items-start gap-3 mb-4">
              <RefreshCw className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Exchange for Wrong Product</h2>
                <p className="text-muted-foreground">
                  If you mistakenly ordered the wrong product and would like to exchange it, please note that the shipping charges for returning the item and for the replacement item will be your responsibility, since we are a wholesale website and not a retail website. Please contact our customer support team for further instructions on how to proceed with the exchange.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">Sd-Jewels Policy for Custom-Printed Products</h2>
            
            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">a. Order Cancellation</h3>
                <p className="text-muted-foreground">
                  Once a customer places an order for a printed product, it cannot be canceled. This is due to the production costs associated with printing on the bottle and the inability to resell the customized item.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">b. Undeliverable Shipments</h3>
                <p className="text-muted-foreground">
                  If a shipment cannot be delivered by the designated courier, Sd-Jewels will arrange for the shipment to be sent via an alternative courier service. However, the product will not be taken back under any circumstances.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <div className="flex items-start gap-3 mb-4">
              <Clock className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Delayed Deliveries by Courier</h2>
                <p className="text-muted-foreground mb-3">
                  If delivery occurs beyond the standard time frame (e.g., 1–2 months due to courier delays), Sd-Jewels will work with the courier service to address concerns on a case-by-case basis, provided the delay was courier-related.
                </p>
                <p className="text-muted-foreground">
                  We recommend tracking your order regularly and contacting us if the parcel shows no updates within 15 days of dispatch.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">Exceptions</h2>
            <p className="text-muted-foreground">
              Sd-Jewels cannot assume responsibility for unreported damages or claims made beyond the above timelines. Please understand that these measures are in place to adhere to courier regulations.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">Refund Eligibility</h2>
            <p className="text-muted-foreground mb-4">
              Refunds will be processed for eligible returns based on the following criteria:
            </p>

            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">a. Damaged or Defective Products</h3>
                <p className="text-muted-foreground">
                  Upon confirmation of the damage or defect through the provided video, we will proceed with the refund process.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">b. Missing Items</h3>
                <p className="text-muted-foreground">
                  If we are unable to provide the missing item(s) from your order, a refund will be issued for the respective item(s).
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">Original Condition and Packaging</h2>
            <p className="text-muted-foreground">
              To qualify for a refund or exchange, returned products must be in their original condition, unused, unwashed, and undamaged. All original packaging, including accessories, tags, and labels, should be included.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">Return Shipping</h2>
            <p className="text-muted-foreground">
              The cost of return shipping will be your responsibility, except in cases where the return is a result of our error (e.g., damaged or incorrect item sent). We recommend using a reliable shipping service with tracking to ensure the safe return of the product.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">Rejection / Denial of Parcel Policy</h2>
            <p className="text-muted-foreground mb-4">
              If a customer rejects or denies accepting the parcel after it has been dispatched, the following deductions will apply:
            </p>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[140px]">Shipping Charge:</span>
                  <span className="text-muted-foreground">2 times the original shipping charge will be deducted (includes forward and reverse shipping)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[140px]">Packing Charge:</span>
                  <span className="text-muted-foreground">10% of the product value will be deducted as a packing charge</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                These deductions will be made before issuing any refunds.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">Refund Process</h2>
            <p className="text-muted-foreground mb-4">
              Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, the refund will be processed and applied to the original method of payment within 7 days.
            </p>
            <p className="text-muted-foreground mb-4">
              It usually takes more than 7 days to deliver the products after placing the order. Refund timelines are calculated from the date of receipt.
            </p>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">The return will be processed only if:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>It is determined that the product was not damaged while in your possession</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>The product is not different from what was shipped to you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>The product is returned in its original condition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Customer must take an unboxing video</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>The product is unused, undamaged, and with the original packaging, receipt, and invoice</span>
                </li>
              </ul>
            </div>

            <p className="text-muted-foreground mt-4">
              Only when the product reaches our premises will the refund be processed as decided.
            </p>

            <p className="text-muted-foreground mt-4">
              If you feel that the product received is not as shown on the site or not as per your expectations, you must bring it to the notice of our customer service within 24 hours of receiving the product. The Customer Service Team, after reviewing your complaint, will take an appropriate decision.
            </p>
          </section>

          <Separator />

          <section>
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Phone className="h-6 w-6 text-primary" />
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Address</p>
                    <p className="text-muted-foreground">
                      SD-Jewels<br />
                      89th Thandupathai Street,<br />
                      Annasagaram,<br />
                      Dharmapuri, Tamil Nadu – 636704
                    </p>
                  </div>
                </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Support Contact</p>
                      <p className="text-muted-foreground">9363475021</p>
                    </div>
                  </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Support Hours</p>
                    <p className="text-muted-foreground">Monday to Friday, 9:00 AM to 7:00 PM</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-6 pt-6 border-t">
                For any questions, you can easily contact us.
              </p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
