import { supabase } from "@/integrations/supabase/client";
import { commentTranslations } from "@/translations/commentTranslations";
import type { Language } from "@/hooks/useLanguage";

// Función para detectar el idioma del comentario basado en palabras clave
const detectLanguage = (text: string): Language => {
  const lowerText = text.toLowerCase();
  
  // Palabras clave por idioma
  const languageKeywords = {
    es: ['es', 'muy', 'bueno', 'excelente', 'gracias', 'hola', 'sistema', 'que', 'como', 'por', 'para', 'con', 'una', 'este', 'esta'],
    en: ['is', 'very', 'good', 'excellent', 'thank', 'hello', 'system', 'that', 'how', 'for', 'with', 'this', 'the', 'and', 'are'],
    fr: ['est', 'très', 'bon', 'excellent', 'merci', 'bonjour', 'système', 'que', 'comment', 'pour', 'avec', 'cette', 'une', 'le', 'la'],
    de: ['ist', 'sehr', 'gut', 'ausgezeichnet', 'danke', 'hallo', 'system', 'das', 'wie', 'für', 'mit', 'diese', 'ein', 'der', 'die'],
    it: ['è', 'molto', 'buono', 'eccellente', 'grazie', 'ciao', 'sistema', 'che', 'come', 'per', 'con', 'questa', 'una', 'il', 'la'],
    pt: ['é', 'muito', 'bom', 'excelente', 'obrigado', 'olá', 'sistema', 'que', 'como', 'para', 'com', 'esta', 'uma', 'o', 'a']
  };
  
  let scores: Record<Language, number> = {
    es: 0,
    en: 0,
    fr: 0,
    de: 0,
    it: 0,
    pt: 0
  };
  
  // Contar coincidencias de palabras clave
  Object.entries(languageKeywords).forEach(([lang, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores[lang as Language]++;
      }
    });
  });
  
  // Encontrar el idioma con más coincidencias
  const detectedLang = Object.entries(scores).reduce((a, b) => 
    scores[a[0] as Language] > scores[b[0] as Language] ? a : b
  )[0] as Language;
  
  // Si no hay coincidencias claras, defaultear a español
  return scores[detectedLang] > 0 ? detectedLang : 'es';
};

export const createAutoReply = async (originalCommentId: string, originalContent: string, userLanguage: Language) => {
  try {
    console.log('=== INICIANDO CREACIÓN DE RESPUESTA AUTOMÁTICA ===');
    console.log('ID del comentario original:', originalCommentId);
    console.log('Contenido original:', originalContent);
    console.log('Idioma seleccionado por el usuario:', userLanguage);
    
    // Verificar que el idioma es válido
    if (!commentTranslations[userLanguage]) {
      console.error('Idioma no válido:', userLanguage);
      return false;
    }
    
    // Obtener la respuesta automática en el idioma del usuario
    const autoReplyText = commentTranslations[userLanguage].autoReply;
    console.log('🔍 DEBUGGING - Idioma del usuario:', userLanguage);
    console.log('🔍 DEBUGGING - Texto de respuesta automática:', autoReplyText);
    console.log('🔍 DEBUGGING - Todas las traducciones disponibles:', commentTranslations);
    
    // Crear la respuesta automática
    console.log('Insertando respuesta automática en la base de datos...');
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: autoReplyText,
        user_id: 'sistema-automatico',
        is_approved: true,
        moderation_status: 'approved',
        parent_comment_id: originalCommentId
      })
      .select();
    
    if (error) {
      console.error('❌ Error al crear respuesta automática:', error);
      console.error('Detalles del error:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log('✅ Respuesta automática creada exitosamente:', data);
    console.log('=== RESPUESTA AUTOMÁTICA COMPLETADA ===');
    return true;
  } catch (error) {
    console.error('❌ Error general en createAutoReply:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return false;
  }
};