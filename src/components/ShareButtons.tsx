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
  Music
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonsProps {
  title?: string;
  description?: string;
}

export function ShareButtons({ 
  title = "Sistema profesional de avalúos - Evaluación de propiedades",
  description = "Sistema de valuación inmobiliaria más avanzado y confiable de América. Obtén avalúos profesionales instantáneos."
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  
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
      action: 'copy' // Instagram no tiene API directa, copiamos enlace
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
      console.log("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar el enlace");
    }
  };

  const handleShare = (social: any) => {
    if (social.action === 'copy') {
      // Para redes que no tienen API directa, copiamos el enlace y abrimos la red social
      copyToClipboard();
      setTimeout(() => {
        window.open(social.url, '_blank', 'noopener,noreferrer');
      }, 500);
    } else {
      // Para redes con API de compartir directo
      window.open(social.url, '_blank', 'noopener,noreferrer');
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
      <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-sm border shadow-lg">
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