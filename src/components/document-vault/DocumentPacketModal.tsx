
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Document, DocumentPacket } from "@/types/document";
import { formatDate } from "@/utils/documentUtils";
import { FileText, Share, Lock } from "lucide-react";

interface DocumentPacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocuments: Document[];
  onCreatePacket: (packet: Partial<DocumentPacket>) => void;
}

export function DocumentPacketModal({ 
  isOpen, 
  onClose, 
  selectedDocuments,
  onCreatePacket
}: DocumentPacketModalProps) {
  const [packetName, setPacketName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [accessType, setAccessType] = useState<"view" | "edit">("view");
  
  const handleSubmit = () => {
    if (!packetName.trim()) return;
    
    onCreatePacket({
      name: packetName,
      documentIds: selectedDocuments.map(d => d.id),
      accessType: accessType,
      shareExpiry: expiryDate || undefined,
      sharePassword: usePassword ? password : undefined,
      createdAt: new Date().toISOString()
    });
    
    // Reset form
    setPacketName("");
    setExpiryDate("");
    setUsePassword(false);
    setPassword("");
    setAccessType("view");
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Document Packet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="packet-name" className="text-sm font-medium block mb-1">Packet Name</label>
            <Input
              id="packet-name"
              value={packetName}
              onChange={(e) => setPacketName(e.target.value)}
              placeholder="Enter packet name"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Selected Documents ({selectedDocuments.length})</h3>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2">
              {selectedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center py-1 text-sm">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  {doc.name}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="access-type" className="text-sm font-medium block mb-1">Access Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="access-type"
                  value="view"
                  checked={accessType === "view"}
                  onChange={() => setAccessType("view")}
                  className="mr-2"
                />
                View Only
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="access-type"
                  value="edit"
                  checked={accessType === "edit"}
                  onChange={() => setAccessType("edit")}
                  className="mr-2"
                />
                Allow Edits
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="expiry-date" className="text-sm font-medium block mb-1">Link Expiry (Optional)</label>
            <Input
              id="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="use-password" 
              checked={usePassword}
              onCheckedChange={(checked) => setUsePassword(checked === true)}
            />
            <label
              htmlFor="use-password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Password Protect
            </label>
          </div>
          
          {usePassword && (
            <div>
              <label htmlFor="packet-password" className="text-sm font-medium block mb-1">Password</label>
              <div className="relative">
                <Input
                  id="packet-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="pr-10"
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!packetName.trim() || (usePassword && !password)}
          >
            <Share className="mr-2 h-4 w-4" />
            Create Packet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
