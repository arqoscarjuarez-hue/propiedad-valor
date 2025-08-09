import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  MessageCircle, 
  Send, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Copy,
  Check,
  FileText,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ShareButtonsProps {
  title?: string;
  description?: string;
  onGeneratePDF?: () => void;
  onGenerateWord?: () => void;
  onGeneratePDFBlob?: () => Promise<Blob | null>;
  onGenerateWordBlob?: () => Promise<Blob | null>;
}

export function ShareButtons({ 
  title = "Sistema profesional de avalúos - Evaluación de propiedades",
  description = "Sistema de valuación inmobiliaria más avanzado y confiable de América. Obtén avalúos profesionales instantáneos.",
  onGeneratePDF,
  onGenerateWord,
  onGeneratePDFBlob,
  onGenerateWordBlob
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  
  const currentUrl = window.location.href;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace se ha copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive"
      });
    }
  };

  // Función para compartir directamente con Web Share API
  const shareDirectWithFiles = async (platform: string) => {
    if (!onGeneratePDFBlob || !onGenerateWordBlob) {
      // Fallback a la función anterior
      shareWithDocuments(platform, getShareUrl(platform));
      return;
    }

    setIsSharing(true);

    try {
      toast({
        title: `Preparando archivos para ${platform}`,
        description: "Generando documentos como archivos...",
      });

      // Generar los documentos como Blobs
      console.log('Generando PDF como Blob...');
      const pdfBlob = await onGeneratePDFBlob();
      
      console.log('Generando Word como Blob...');
      const wordBlob = await onGenerateWordBlob();

      const files: File[] = [];
      
      if (pdfBlob) {
        files.push(new File([pdfBlob], `avaluo-${Date.now()}.pdf`, { type: 'application/pdf' }));
      }
      
      if (wordBlob) {
        files.push(new File([wordBlob], `avaluo-${Date.now()}.docx`, { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        }));
      }

      // Verificar si Web Share API está disponible y soporta archivos
      if (navigator.share && files.length > 0) {
        // Verificar si se pueden compartir archivos
        const canShareFiles = navigator.canShare && navigator.canShare({ files });
        
        if (canShareFiles) {
          // Compartir directamente con archivos
          await navigator.share({
            title: title,
            text: `${description}\n\n📄 Documentos del avalúo profesional adjuntos`,
            files: files
          });

          toast({
            title: "¡Archivos compartidos!",
            description: "Los documentos se han enviado directamente",
          });
          return;
        }
      }

      // Fallback: Crear URLs de descarga y compartir enlaces
      const pdfUrl = pdfBlob ? URL.createObjectURL(pdfBlob) : null;
      const wordUrl = wordBlob ? URL.createObjectURL(wordBlob) : null;

      if (pdfUrl) {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `avaluo-${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(pdfUrl);
      }

      if (wordUrl) {
        const link = document.createElement('a');
        link.href = wordUrl;
        link.download = `avaluo-${Date.now()}.docx`;
        link.click();
        URL.revokeObjectURL(wordUrl);
      }

      // Abrir la plataforma con el mensaje
      window.open(getShareUrl(platform), '_blank', 'noopener,noreferrer');

      toast({
        title: `${platform} abierto`,
        description: "Los documentos se han descargado. Adjúntalos en la aplicación.",
        duration: 5000,
      });

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error en shareDirectWithFiles:', error);
        toast({
          title: "Error",
          description: `No se pudieron compartir los archivos directamente. Usa la descarga manual.`,
          variant: "destructive"
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Función auxiliar para obtener URLs de compartir
  const getShareUrl = (platform: string): string => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(currentUrl);

    switch (platform) {
      case 'WhatsApp':
        return `https://wa.me/?text=${encodedMessage}`;
      case 'Telegram':
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`;
      case 'Email':
        return `mailto:?subject=${encodedTitle}&body=${encodedMessage}`;
      default:
        return currentUrl;
    }
  };

  // Función principal para compartir con documentos (fallback)
  const shareWithDocuments = async (platform: string, shareUrl: string) => {
    if (!onGeneratePDF || !onGenerateWord) {
      toast({
        title: "Error",
        description: "Las funciones de generación no están disponibles",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);

    try {
      toast({
        title: `Preparando para ${platform}`,
        description: "Generando documentos del avalúo...",
      });

      console.log('Iniciando generación de PDF...');
      onGeneratePDF();
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Iniciando generación de Word...');
      onGenerateWord();
      await new Promise(resolve => setTimeout(resolve, 1500));

      window.open(shareUrl, '_blank', 'noopener,noreferrer');

      toast({
        title: `${platform} abierto`,
        description: "Los documentos se han descargado. Adjúntalos en la aplicación.",
        duration: 5000,
      });

    } catch (error) {
      console.error('Error en shareWithDocuments:', error);
      toast({
        title: "Error",
        description: `No se pudo preparar el contenido para ${platform}`,
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Función para compartir solo enlace
  const shareLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Preparar mensajes para compartir
  const shareMessage = `${title}\n\n${description}\n\n📄 Documentos del avalúo profesional incluidos\n\n🔗 ${currentUrl}`;
  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(currentUrl);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          disabled={isSharing}
          className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border-primary/30 hover:border-primary/50 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Share2 className="h-5 w-5" />
          {isSharing ? "Preparando..." : "Compartir"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-sm border shadow-lg">
        
        {/* Sección: Compartir DIRECTO con archivos (Web Share API) */}
        {navigator.share && onGeneratePDFBlob && onGenerateWordBlob && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-green-100 dark:bg-green-900">
              🚀 ENVÍO DIRECTO
            </div>
            
            <DropdownMenuItem
              onClick={() => shareDirectWithFiles('Compartir')}
              disabled={isSharing}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors bg-green-50 dark:bg-green-900/20"
            >
              <Share2 className="h-4 w-4 text-green-600" />
              <div className="flex flex-col">
                <span className="font-medium">Enviar archivos directamente</span>
                <span className="text-xs text-muted-foreground">PDF + Word a cualquier app</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
          </>
        )}

        {/* Sección: Compartir con documentos */}
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
          📄 COMPARTIR CON DOCUMENTOS
        </div>
        
        <DropdownMenuItem
          onClick={() => shareWithDocuments('WhatsApp', `https://wa.me/?text=${encodedMessage}`)}
          disabled={isSharing}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          <div className="flex flex-col">
            <span className="font-medium">WhatsApp</span>
            <span className="text-xs text-muted-foreground">Genera PDF + Word</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => shareWithDocuments('Telegram', `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`)}
          disabled={isSharing}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Send className="h-4 w-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="font-medium">Telegram</span>
            <span className="text-xs text-muted-foreground">Genera PDF + Word</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => shareWithDocuments('Email', `mailto:?subject=${encodedTitle}&body=${encodedMessage}`)}
          disabled={isSharing}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Mail className="h-4 w-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">Email</span>
            <span className="text-xs text-muted-foreground">Genera PDF + Word</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sección: Descargas individuales */}
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
          💾 DESCARGAR INDIVIDUAL
        </div>
        
        {onGeneratePDF && (
          <DropdownMenuItem
            onClick={() => {
              onGeneratePDF();
              toast({
                title: "Generando PDF",
                description: "El avalúo en PDF se descargará automáticamente",
              });
            }}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <FileText className="h-4 w-4 text-red-600" />
            <span className="font-medium">Solo PDF</span>
          </DropdownMenuItem>
        )}
        
        {onGenerateWord && (
          <DropdownMenuItem
            onClick={() => {
              onGenerateWord();
              toast({
                title: "Generando Word",
                description: "El avalúo en Word se descargará automáticamente",
              });
            }}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Solo Word</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Sección: Redes sociales (solo enlace) */}
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
          🌐 COMPARTIR ENLACE
        </div>
        
        <DropdownMenuItem
          onClick={() => shareLink(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          <span className="font-medium">Facebook</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => shareLink(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Twitter className="h-4 w-4 text-gray-800" />
          <span className="font-medium">Twitter</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => shareLink(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Linkedin className="h-4 w-4 text-blue-700" />
          <span className="font-medium">LinkedIn</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={copyToClipboard}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-gray-600" />
          )}
          <span className="font-medium">
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}