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
  const { toast } = useToast();
  
  const currentUrl = window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20-%20${encodedDescription}%20${encodedUrl}`,
      color: 'text-green-600 hover:text-green-700'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: `https://www.instagram.com/`,
      color: 'text-pink-600 hover:text-pink-700',
      action: 'copy'
    },
    {
      name: 'TikTok',
      icon: Music,
      url: `https://www.tiktok.com/`,
      color: 'text-black hover:text-gray-800',
      action: 'copy'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'text-blue-600 hover:text-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'text-gray-800 hover:text-gray-900'
    },
    {
      name: 'Telegram',
      icon: Send,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'text-blue-500 hover:text-blue-600'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: `https://www.youtube.com/`,
      color: 'text-red-600 hover:text-red-700',
      action: 'copy'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'text-blue-700 hover:text-blue-800'
    },
    {
      name: 'Gmail',
      icon: Mail,
      url: `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`,
      color: 'text-red-500 hover:text-red-600'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`,
      color: 'text-gray-600 hover:text-gray-700'
    }
  ];

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

  const handleShare = (social: any) => {
    if (social.action === 'copy') {
      copyToClipboard();
      setTimeout(() => {
        window.open(social.url, '_blank', 'noopener,noreferrer');
      }, 500);
    } else {
      window.open(social.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleGeneratePDF = () => {
    console.log('PDF clicked - onGeneratePDF available:', !!onGeneratePDF);
    if (onGeneratePDF) {
      onGeneratePDF();
      toast({
        title: "Generando PDF",
        description: "El avalúo en PDF se descargará automáticamente",
      });
    } else {
      toast({
        title: "Error",
        description: "No se puede generar el PDF en este momento",
        variant: "destructive"
      });
    }
  };

  const handleGenerateWord = () => {
    console.log('Word clicked - onGenerateWord available:', !!onGenerateWord);
    if (onGenerateWord) {
      onGenerateWord();
      toast({
        title: "Generando Word",
        description: "El avalúo en Word se descargará automáticamente",
      });
    } else {
      toast({
        title: "Error",
        description: "No se puede generar el documento Word en este momento",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border-primary/30 hover:border-primary/50 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Share2 className="h-5 w-5" />
          Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 bg-background/95 backdrop-blur-sm border shadow-lg">
        {/* Opciones de descarga de documentos */}
        {(onGeneratePDF || onGenerateWord) && (
          <>
            {onGeneratePDF && (
              <DropdownMenuItem
                onClick={handleGeneratePDF}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-4 w-4 text-red-600" />
                <span className="font-medium">Descargar PDF</span>
              </DropdownMenuItem>
            )}
            {onGenerateWord && (
              <DropdownMenuItem
                onClick={handleGenerateWord}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Download className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Descargar Word</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}
        
        {shareLinks.map((social) => (
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