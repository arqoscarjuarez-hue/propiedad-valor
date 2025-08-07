-- Delete comments with inappropriate content in multiple languages
-- Spanish inappropriate words
DELETE FROM public.comments 
WHERE LOWER(content) SIMILAR TO '%(cerotes|culeros|mamones|mierda|pendejo|babosadas|cabron|pinche|joder|coño|puta|puto|hijo de puta|gilipollas|imbecil|idiota|estupido|maricon|bolludo|pelotudo|la concha|chingar|verga|perra|zorra|rata|basura)%';

-- English inappropriate words
DELETE FROM public.comments 
WHERE LOWER(content) SIMILAR TO '%(fuck|shit|bitch|asshole|damn|hell|crap|stupid|idiot|moron|retard|gay|fag|whore|slut|bastard|prick|douche|jackass|dumbass)%';

-- French inappropriate words
DELETE FROM public.comments 
WHERE LOWER(content) SIMILAR TO '%(merde|putain|connard|salope|enculé|fils de pute|crétin|imbécile|con|chiant|emmerdeur|bordel)%';

-- German inappropriate words
DELETE FROM public.comments 
WHERE LOWER(content) SIMILAR TO '%(scheiße|arschloch|idiot|blödmann|hurensohn|fotze|schwuchtel|verdammt|mist|kacke)%';

-- Italian inappropriate words
DELETE FROM public.comments 
WHERE LOWER(content) SIMILAR TO '%(merda|cazzo|stronzo|figlio di puttana|bastardo|idiota|imbecille|cretino|porco|maledetto)%';

-- Portuguese inappropriate words
DELETE FROM public.comments 
WHERE LOWER(content) SIMILAR TO '%(merda|caralho|filho da puta|idiota|imbecil|burro|estúpido|porra|buceta|vadía|desgraçado)%';

-- Also delete comments that are just spam or meaningless
DELETE FROM public.comments 
WHERE LOWER(content) SIMILAR TO '%(aaaa+|hhhh+|gggg+|ffff+|dddd+|ssss+|wwww+|eeee+|rrrr+|tttt+|yyyy+|uuuu+|iiii+|oooo+|pppp+)%'
   OR LENGTH(TRIM(content)) < 3
   OR content SIMILAR TO '%[0-9]{4,}%'
   OR LOWER(content) SIMILAR TO '%(test|prueba|testing|probando|asdf|qwerty|123|abc)%';