-- Add DELETE policy for comments table to allow removal of inappropriate content
CREATE POLICY "Allow deletion of inappropriate comments" 
ON public.comments 
FOR DELETE 
USING (true);

-- Delete comments with inappropriate content
DELETE FROM public.comments 
WHERE content LIKE '%cerotes%' 
   OR content LIKE '%culeros%' 
   OR content LIKE '%mamones%' 
   OR content LIKE '%mierda%' 
   OR content LIKE '%pendejo%' 
   OR content LIKE '%babosadas%';