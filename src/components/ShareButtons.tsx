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
  Youtube,
  Instagram,
  Music,
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
}

export function ShareButtons({ 
  title = "Sistema profesional de avalúos - Evaluación de propiedades",
  description = "Sistema de valuación inmobiliaria más avanzado y confiable de América. Obtén avalúos profesionales instantáneos.",
  onGeneratePDF,
  onGenerateWord
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const currentUrl = window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  // Mensaje para compartir con documentos
  const shareMessage = `${title}\n\n${description}\n\n📄 He adjuntado los documentos del avalúo profesional (PDF y Word)\n\n🔗 Obtén tu propio avalúo en: ${currentUrl}`;
  const encodedShareMessage = encodeURIComponent(shareMessage);

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

  // Función para generar ambos documentos y luego compartir
  const generateDocumentsAndShare = async (shareAction: () => void) => {
    if (!onGeneratePDF || !onGenerateWord) {
      toast({
        title: "Error",
        description: "No se pueden generar los documentos en este momento",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generar PDF
      toast({
        title: "Generando documentos...",
        description: "Preparando PDF y Word para compartir",
      });
      
      onGeneratePDF();
      
      // Esperar un poco para que se genere el PDF
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar Word
      onGenerateWord();
      
      // Esperar un poco para que se genere el Word
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "¡Documentos generados!",
        description: "Ahora puedes adjuntarlos en la aplicación que se abrirá",
      });
      
      // Ejecutar la acción de compartir
      shareAction();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron generar los documentos",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedShareMessage}`,
      color: 'text-green-600 hover:text-green-700',
      withDocuments: true
    },
    {
      name: 'Telegram',
      icon: Send,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedShareMessage}`,
      color: 'text-blue-500 hover:text-blue-600',
      withDocuments: true
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedShareMessage}`,
      color: 'text-gray-600 hover:text-gray-700',
      withDocuments: true
    },
    {
      name: 'Gmail',
      icon: Mail,
      url: `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodedTitle}&body=${encodedShareMessage}`,
      color: 'text-red-500 hover:text-red-600',
      withDocuments: true
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: `https://www.instagram.com/`,
      color: 'text-pink-600 hover:text-pink-700',
      action: 'copy',
      withDocuments: false
    },
    {
      name: 'TikTok',
      icon: Music,
      url: `https://www.tiktok.com/`,
      color: 'text-black hover:text-gray-800',
      action: 'copy',
      withDocuments: false
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'text-blue-600 hover:text-blue-700',
      withDocuments: false
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'text-gray-800 hover:text-gray-900',
      withDocuments: false
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'text-blue-700 hover:text-blue-800',
      withDocuments: false
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: `https://www.youtube.com/`,
      color: 'text-red-600 hover:text-red-700',
      action: 'copy',
      withDocuments: false
    }
  ];

  const handleShare = (social: any) => {
    if (social.withDocuments) {
      // Para redes que soportan documentos, generar primero los archivos
      generateDocumentsAndShare(() => {
        if (social.action === 'copy') {
          copyToClipboard();
          setTimeout(() => {
            window.open(social.url, '_blank', 'noopener,noreferrer');
          }, 500);
        } else {
          window.open(social.url, '_blank', 'noopener,noreferrer');
        }
        
        // Mostrar instrucciones específicas
        setTimeout(() => {
          toast({
            title: `Compartir en ${social.name}`,
            description: "Los documentos se han descargado. Adjúntalos en la aplicación que se abrió.",
          });
        }, 1500);
      });
    } else {
      // Para redes que no soportan documentos, compartir solo el enlace
      if (social.action === 'copy') {
        copyToClipboard();
        setTimeout(() => {
          window.open(social.url, '_blank', 'noopener,noreferrer');
        }, 500);
      } else {
        window.open(social.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleDirectDownload = (type: 'pdf' | 'word') => {
    if (type === 'pdf' && onGeneratePDF) {
      onGeneratePDF();
      toast({
        title: "Generando PDF",
        description: "El avalúo en PDF se descargará automáticamente",
      });
    } else if (type === 'word' && onGenerateWord) {
      onGenerateWord();
      toast({
        title: "Generando Word",
        description: "El avalúo en Word se descargará automáticamente",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border-primary/30 hover:border-primary/50 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Share2 className="h-5 w-5" />
          {isGenerating ? "Generando..." : "Compartir"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-sm border shadow-lg">
        {/* Opciones de descarga directa */}
        {(onGeneratePDF || onGenerateWord) && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
              DESCARGAR DOCUMENTOS
            </div>
            {onGeneratePDF && (
              <DropdownMenuItem
                onClick={() => handleDirectDownload('pdf')}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-4 w-4 text-red-600" />
                <span className="font-medium">Descargar PDF</span>
              </DropdownMenuItem>
            )}
            {onGenerateWord && (
              <DropdownMenuItem
                onClick={() => handleDirectDownload('word')}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Download className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Descargar Word</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Redes que soportan documentos */}
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
          COMPARTIR CON DOCUMENTOS
        </div>
        {shareLinks.filter(social => social.withDocuments).map((social) => (
          <DropdownMenuItem
            key={social.name}
            onClick={() => handleShare(social)}
            disabled={isGenerating}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <social.icon className={`h-4 w-4 ${social.color}`} />
            <div className="flex flex-col">
              <span className="font-medium">{social.name}</span>
              <span className="text-xs text-muted-foreground">Con archivos adjuntos</span>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Redes que solo soportan enlaces */}
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
          COMPARTIR ENLACE
        </div>
        {shareLinks.filter(social => !social.withDocuments).map((social) => (
          <DropdownMenuItem
            key={social.name}
            onClick={() => handleShare(social)}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <social.icon className={`h-4 w-4 ${social.color}`} />
            <span className="font-medium">{social.name}</span>
          </DropdownMenuItem>
        ))}
        
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