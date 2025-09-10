import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SignatureCanvas from 'react-signature-canvas';
import { Pen, Upload, RotateCcw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SignatureCanvasProps {
  onSign: (signatureDataUrl: string, signatureFile?: File) => Promise<void>;
}

const GNSignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSign }) => {
  const canvasRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [signatureType, setSignatureType] = useState<'draw' | 'upload'>('draw');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedImageData, setUploadedImageData] = useState<File | null>(null);

  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setUploadedImage(null);
    setUploadedImageData(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    //setUploadedImage (event.target.files[0] ? URL.createObjectURL(event.target.files[0]) : null);
    setUploadedImageData(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSign = async () => {
    let signatureDataUrl = '';

    if (signatureType === 'draw') {
      if (!canvasRef.current || canvasRef.current.isEmpty()) {
        toast.error('Please draw your signature first');
        return;
      }
      
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
      const canvas = canvasRef.current.getCanvas();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Add white background
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        signatureDataUrl = canvas.toDataURL('image/png');
      }
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'signature.png', { type: 'image/png' });
          console.log('Generated file from canvas blob:', file);
          setUploadedImage(URL.createObjectURL(file));
          setUploadedImageData(file);
        }
      });
      
    } else {
      if (!uploadedImage) {
        toast.error('Please upload a signature image');
        return;
      }
      signatureDataUrl = uploadedImage;
    }

    setIsProcessing(true);
    
    try {
      await onSign(signatureDataUrl, uploadedImageData || undefined);
    } catch (error) {
      toast.error('Failed to apply signature');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={signatureType} onValueChange={(value) => setSignatureType(value as 'draw' | 'upload')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="draw" className="flex items-center space-x-2">
            <Pen className="h-4 w-4" />
            <span>Draw Signature</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload Image</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <Label className="text-base font-medium">
                    Draw your signature in the box below
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use your mouse or touch screen to sign
                  </p>
                </div>
                
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-white">
                  <SignatureCanvas
                    ref={canvasRef}
                    canvasProps={{
                      width: 500,
                      height: 200,
                      className: 'signature-canvas w-full h-full'
                    }}
                    backgroundColor="#ffffff"
                    penColor="#000000"
                  />
                </div>
                
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={clearCanvas}
                    disabled={isProcessing}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="signature-file" className="text-base font-medium">
                    Upload Signature Image
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supported formats: PNG, JPG, GIF (max 5MB)
                  </p>
                </div>
                
                <Input
                  ref={fileInputRef}
                  id="signature-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="cursor-pointer"
                />
                
                {uploadedImage && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                      <img
                        src={uploadedImage}
                        alt="Uploaded signature"
                        className="max-w-full max-h-32 mx-auto object-contain border border-border rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Legal Notice */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">Legal Acknowledgment</h4>
            <p className="text-xs text-muted-foreground mt-1">
              By applying your digital signature, you certify that you have reviewed all documents 
              and confirm their authenticity as per your official duties as Grama Niladhari.
              This signature carries the same legal weight as your physical signature.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={clearCanvas} disabled={isProcessing}>
          Cancel
        </Button>
        <Button 
          onClick={handleSign} 
          disabled={isProcessing}
          className="bg-primary hover:bg-primary-hover"
        >
          {isProcessing ? (
            <>Processing...</>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Apply Signature
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GNSignatureCanvas;