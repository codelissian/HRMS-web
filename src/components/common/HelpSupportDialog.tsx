import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';

interface HelpSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORT_PHONE = '+917805940012';
const SUPPORT_PHONE_CLEAN = '917805940012'; // For WhatsApp link (no + or spaces)

export function HelpSupportDialog({ open, onOpenChange }: HelpSupportDialogProps) {
  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${SUPPORT_PHONE_CLEAN}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCallClick = () => {
    const telUrl = `tel:${SUPPORT_PHONE}`;
    window.location.href = telUrl;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
          <DialogDescription>
            Get in touch with our support team. We're here to help you!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Phone Number Display */}
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground mb-1">Contact Number</p>
            <p className="text-lg font-semibold text-foreground">{SUPPORT_PHONE}</p>
          </div>

          {/* WhatsApp Button */}
          <Button
            onClick={handleWhatsAppClick}
            className="w-full justify-start gap-3 h-auto py-3"
            variant="outline"
          >
            <MessageCircle className="h-5 w-5 text-green-600" />
            <div className="flex flex-col items-start">
              <span className="font-medium">WhatsApp Us</span>
              <span className="text-xs text-muted-foreground">
                Chat with us on WhatsApp
              </span>
            </div>
          </Button>

          {/* Call Button */}
          <Button
            onClick={handleCallClick}
            className="w-full justify-start gap-3 h-auto py-3"
            variant="outline"
          >
            <Phone className="h-5 w-5 text-blue-600" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Call Us</span>
              <span className="text-xs text-muted-foreground">
                Call our support team
              </span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

