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
  Download,
  Smartphone
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
  const shareMessage = `${title}\n\n${description}\n\n📄 Documentos del avalúo profesional incluidos\n\n🔗 ${currentUrl}`;

  // Verificar si Web Share API está disponible
  const canUseNativeShare = navigator.share && navigator.canShare;

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

  // Función para compartir con Web Share API nativa (simplificada)
  const shareWithNativeAPI = async () => {
    if (!canUseNativeShare) {
      toast({
        title: "No disponible",
        description: "Tu dispositivo no soporta compartir archivos directamente",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      toast({
        title: "Generando documentos...",
        description: "Preparando archivos para compartir",
      });

      // Generar documentos normalmente (se descargan)
      if (onGeneratePDF) onGeneratePDF();
      if (onGenerateWord) onGenerateWord();

      // Esperar a que se generen
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Usar Web Share API solo para texto
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: shareMessage,
          url: currentUrl
        });

        toast({
          title: "¡Compartido exitosamente!",
          description: "Los documentos se han descargado. Adjúntalos manualmente en la app que se abrió.",
        });
      } else {
        // Fallback
        if (onGeneratePDF) onGeneratePDF();
        if (onGenerateWord) onGenerateWord();
        
        toast({
          title: "Documentos generados",
          description: "Los archivos se han descargado. Compártelos manualmente.",
        });
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') { // Usuario canceló
        console.error('Error sharing:', error);
        toast({
          title: "Error al compartir",
          description: "No se pudieron compartir los documentos directamente",
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para compartir via WhatsApp con archivos
  const shareViaWhatsApp = async () => {
    setIsGenerating(true);

    try {
      toast({
        title: "Preparando para WhatsApp...",
        description: "Generando documentos",
      });

      // Generar documentos
      if (onGeneratePDF) onGeneratePDF();
      if (onGenerateWord) onGenerateWord();

      // Esperar a que se generen
      await new Promise(resolve => setTimeout(resolve, 2000));

      const whatsappMessage = encodeURIComponent(
        `${title}\n\n${description}\n\n📄 Te envío los documentos del avalúo profesional.\n\n🔗 Visita: ${currentUrl}`
      );

      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      toast({
        title: "WhatsApp abierto",
        description: "Los documentos se han descargado. Adjúntalos en WhatsApp.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo preparar el contenido para WhatsApp",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para compartir via Email con archivos
  const shareViaEmail = async () => {
    setIsGenerating(true);

    try {
      toast({
        title: "Preparando email...",
        description: "Generando documentos",
      });

      // Generar documentos
      if (onGeneratePDF) onGeneratePDF();
      if (onGenerateWord) onGenerateWord();

      // Esperar a que se generen
      await new Promise(resolve => setTimeout(resolve, 2000));

      const emailSubject = encodeURIComponent(title);
      const emailBody = encodeURIComponent(
        `${description}\n\nHe adjuntado los documentos del avalúo profesional (PDF y Word).\n\nPuedes obtener tu propio avalúo en: ${currentUrl}\n\nSaludos cordiales`
      );

      // Abrir cliente de email
      const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
      window.location.href = emailUrl;

      toast({
        title: "Cliente de email abierto",
        description: "Los documentos se han descargado. Adjúntalos en tu email.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo preparar el email",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
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

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      color: 'text-blue-600 hover:text-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`,
      color: 'text-gray-800 hover:text-gray-900'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      color: 'text-blue-700 hover:text-blue-800'
    },
    {
      name: 'Telegram',
      icon: Send,
      url: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`,
      color: 'text-blue-500 hover:text-blue-600'
    }
  ];

  const handleSocialShare = (social: any) => {
    window.open(social.url, '_blank', 'noopener,noreferrer');
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
          {isGenerating ? "Preparando..." : "Compartir"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-background/95 backdrop-blur-sm border shadow-lg">
        
        {/* Compartir nativo (móviles principalmente) */}
        {canUseNativeShare && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
              📱 COMPARTIR DIRECTO
            </div>
            <DropdownMenuItem
              onClick={shareWithNativeAPI}
              disabled={isGenerating}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Smartphone className="h-4 w-4 text-green-600" />
              <div className="flex flex-col">
                <span className="font-medium">Compartir con archivos</span>
                <span className="text-xs text-muted-foreground">Envía documentos directamente</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Compartir con aplicaciones específicas */}
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
          💬 COMPARTIR CON DOCUMENTOS
        </div>
        
        <DropdownMenuItem
          onClick={shareViaWhatsApp}
          disabled={isGenerating}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          <div className="flex flex-col">
            <span className="font-medium">WhatsApp</span>
            <span className="text-xs text-muted-foreground">Genera archivos + abre WhatsApp</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={shareViaEmail}
          disabled={isGenerating}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Mail className="h-4 w-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">Email</span>
            <span className="text-xs text-muted-foreground">Genera archivos + abre email</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Descargas directas */}
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
          📄 DESCARGAR DOCUMENTOS
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

        {/* Redes sociales (solo enlace) */}
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
          🌐 COMPARTIR ENLACE
        </div>
        
        {shareLinks.map((social) => (
          <DropdownMenuItem
            key={social.name}
            onClick={() => handleSocialShare(social)}
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